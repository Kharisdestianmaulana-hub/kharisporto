import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, User } from 'lucide-react';
import { cn } from '../../lib/utils';

// Read all music files from public/music directory
const musicFiles = import.meta.glob('/public/music/*.{mp3,wav,ogg,m4a}', { eager: true });

interface SongMeta {
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
}

interface Song {
  title: string;
  url: string;
  meta: SongMeta | null;
}

const songsList: Song[] = Object.entries(musicFiles).map(([path]) => {
  const url = path.replace('/public', '');
  const filename = path.split('/').pop() || 'Unknown Track';
  const title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  return { title, url, meta: null };
});

// ── Lightweight ID3v2 tag reader (no external dependencies) ──
function readID3(buffer: ArrayBuffer): SongMeta | null {
  const view = new DataView(buffer);
  // Check for "ID3" header
  if (
    view.getUint8(0) !== 0x49 || // I
    view.getUint8(1) !== 0x44 || // D
    view.getUint8(2) !== 0x33    // 3
  ) return null;

  const version = view.getUint8(3);
  const size =
    ((view.getUint8(6) & 0x7f) << 21) |
    ((view.getUint8(7) & 0x7f) << 14) |
    ((view.getUint8(8) & 0x7f) << 7) |
    (view.getUint8(9) & 0x7f);

  let offset = 10;
  const end = 10 + size;
  const decoder = new TextDecoder('utf-8');

  let title = '';
  let artist = '';
  let album = '';
  let albumArt: string | null = null;

  while (offset < end && offset < buffer.byteLength - 10) {
    const frameId = String.fromCharCode(
      view.getUint8(offset), view.getUint8(offset + 1),
      view.getUint8(offset + 2), view.getUint8(offset + 3)
    );

    let frameSize: number;
    if (version === 4) {
      frameSize =
        ((view.getUint8(offset + 4) & 0x7f) << 21) |
        ((view.getUint8(offset + 5) & 0x7f) << 14) |
        ((view.getUint8(offset + 6) & 0x7f) << 7) |
        (view.getUint8(offset + 7) & 0x7f);
    } else {
      frameSize =
        (view.getUint8(offset + 4) << 24) |
        (view.getUint8(offset + 5) << 16) |
        (view.getUint8(offset + 6) << 8) |
        view.getUint8(offset + 7);
    }

    if (frameSize <= 0 || frameId.charCodeAt(0) === 0) break;

    const headerLen = 10;
    const dataStart = offset + headerLen;
    const dataEnd = dataStart + frameSize;

    if (dataEnd > buffer.byteLength) break;

    if (frameId === 'TIT2' || frameId === 'TPE1' || frameId === 'TALB') {
      const encoding = view.getUint8(dataStart);
      let text = '';
      if (encoding === 0 || encoding === 3) {
        // ISO-8859-1 or UTF-8
        text = decoder.decode(new Uint8Array(buffer, dataStart + 1, frameSize - 1)).replace(/\0/g, '');
      } else if (encoding === 1 || encoding === 2) {
        // UTF-16
        const u16decoder = new TextDecoder('utf-16');
        text = u16decoder.decode(new Uint8Array(buffer, dataStart + 1, frameSize - 1)).replace(/\0/g, '');
      }
      if (frameId === 'TIT2') title = text;
      if (frameId === 'TPE1') artist = text;
      if (frameId === 'TALB') album = text;
    }

    if (frameId === 'APIC') {
      const bytes = new Uint8Array(buffer, dataStart, frameSize);
      const encoding = bytes[0];
      let i = 1;
      // Read MIME type
      let mime = '';
      while (i < bytes.length && bytes[i] !== 0) {
        mime += String.fromCharCode(bytes[i]);
        i++;
      }
      i++; // skip null terminator
      i++; // skip picture type byte
      // Skip description
      if (encoding === 0 || encoding === 3) {
        while (i < bytes.length && bytes[i] !== 0) i++;
        i++;
      } else {
        while (i < bytes.length - 1 && !(bytes[i] === 0 && bytes[i + 1] === 0)) i += 2;
        i += 2;
      }
      // The rest is image data
      const imgData = bytes.slice(i);
      if (imgData.length > 0) {
        let binary = '';
        imgData.forEach((b) => (binary += String.fromCharCode(b)));
        if (!mime) mime = 'image/jpeg';
        albumArt = `data:${mime};base64,${window.btoa(binary)}`;
      }
    }

    offset = dataEnd;
  }

  if (!title && !artist && !albumArt) return null;
  return { title, artist, album, albumArt };
}

async function fetchMeta(url: string): Promise<SongMeta | null> {
  try {
    const resp = await fetch(url);
    const buf = await resp.arrayBuffer();
    return readID3(buf);
  } catch {
    return null;
  }
}

export const MusicWidget: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>(songsList);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentSong = songs[currentIndex];

  // Read metadata for all songs on mount
  useEffect(() => {
    const loadMeta = async () => {
      const updated = await Promise.all(
        songsList.map(async (song) => {
          const meta = await fetchMeta(song.url);
          return {
            ...song,
            title: meta?.title || song.title,
            meta,
          };
        })
      );
      setSongs(updated);
    };
    if (songsList.length > 0) loadMeta();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentIndex, currentSong]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch((e) => console.error(e));
    }
    setIsPlaying(!isPlaying);
  }, [currentSong, isPlaying]);

  const handleNext = useCallback(() => {
    if (songs.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  }, [songs.length]);

  const handlePrev = useCallback(() => {
    if (songs.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  }, [songs.length]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current && duration) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
      setProgress(pos * duration);
    }
  };

  const displayTitle = currentSong?.meta?.title || currentSong?.title || 'No Music Selected';
  const displayArtist = currentSong?.meta?.artist || '';
  const albumArt = currentSong?.meta?.albumArt || null;

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-10 w-[580px] h-[360px] bg-slate-900/65 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-2xl shadow-black/50 flex overflow-hidden pointer-events-auto text-white transition-all duration-300">
      
      {/* Sidebar: Song List */}
      <div className="w-[200px] border-r border-white/10 flex flex-col bg-black/20">
        <div className="p-5 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Music size={14} className="text-purple-400" />
            <h3 className="font-bold text-[10px] tracking-widest uppercase text-slate-300">Playlist</h3>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1.5">
          {songs.length === 0 ? (
            <div className="text-xs text-slate-400 px-2 py-4 text-center">
              No music found.<br/>Place audio files in<br/><code className="text-white/70">public/music/</code>
            </div>
          ) : (
            songs.map((song, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(true);
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-2xl text-xs font-medium transition-all",
                  currentIndex === idx 
                    ? "bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                )}
                title={song.meta?.artist ? `${song.title} — ${song.meta.artist}` : song.title}
              >
                <div className="flex items-center gap-2.5">
                  {song.meta?.albumArt ? (
                    <img src={song.meta.albumArt} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <Music size={12} className="text-slate-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 leading-tight text-[11px]">{song.title}</div>
                    {song.meta?.artist && (
                      <div className="line-clamp-1 text-[9px] text-slate-500 mt-0.5">{song.meta.artist}</div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Player */}
      <div className="flex-1 p-8 flex flex-col justify-between relative group overflow-hidden items-center">
        
        {/* Decorative Background Blob */}
        <div className={cn(
          "absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/15 rounded-full blur-[80px] transition-transform duration-3000 pointer-events-none",
          isPlaying ? "scale-150" : "scale-100"
        )}></div>

        {audioRef && currentSong && (
          <audio
            ref={audioRef}
            src={currentSong.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={() => {
              if (audioRef.current) setDuration(audioRef.current.duration);
            }}
          />
        )}

        {/* Top: Album Art & Title */}
        <div className="flex flex-col items-center gap-3 relative z-10 w-full">
          {/* Album Art - shows cover image if available, otherwise vinyl disc */}
          <div className={cn(
            "w-32 h-32 rounded-full shadow-2xl flex items-center justify-center overflow-hidden shrink-0 transition-all duration-700 relative",
            albumArt 
              ? (isPlaying ? "animate-[spin_8s_linear_infinite] ring-4 ring-purple-500/20 shadow-purple-500/20" : "ring-4 ring-white/10")
              : (isPlaying ? "animate-[spin_4s_linear_infinite] shadow-purple-500/20 ring-8 ring-purple-500/10 bg-gradient-to-br from-slate-800 to-slate-950" : "ring-8 ring-white/5 bg-gradient-to-br from-slate-800 to-slate-950")
          )}>
            {albumArt ? (
              <>
                <img src={albumArt} alt="Album Art" className="w-full h-full object-cover" />
                {/* Center hole overlay for vinyl effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-slate-900/80 rounded-full ring-2 ring-slate-800/60 shadow-inner"></div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-slate-900/90 rounded-full ring-2 ring-slate-800/80 z-10 shadow-inner"></div>
                {/* Vinyl grooves */}
                <div className="absolute inset-1.5 rounded-full border border-white/5"></div>
                <div className="absolute inset-4 rounded-full border border-white/5"></div>
                <div className="absolute inset-7 rounded-full border border-white/5"></div>
                <div className="absolute inset-10 rounded-full border border-white/5"></div>
                <div className="absolute inset-13 rounded-full border border-white/5"></div>
                <Music size={32} className="absolute text-purple-500/20" />
              </>
            )}
          </div>
          
          {/* Title & Artist */}
          <div className="w-full overflow-hidden relative flex flex-col items-center gap-1">
            {/* Marquee Container */}
            <div 
              className="w-full overflow-hidden relative text-center px-4"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
            >
              <div className="whitespace-nowrap inline-block animate-[marquee_12s_linear_infinite] hover:[animation-play-state:paused] min-w-full">
                <span className="text-lg font-bold text-white pr-12">
                  {displayTitle}
                </span>
                <span className="text-lg font-bold text-white pr-12">
                  {displayTitle}
                </span>
              </div>
            </div>
            
            {/* Artist name */}
            {displayArtist && (
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <User size={12} />
                <span>{displayArtist}</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full mt-auto space-y-3">
          {/* Middle: Progress Bar */}
          <div className="relative z-10 px-2">
            <div 
              className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer relative group/progress transition-all hover:h-2"
              onClick={handleProgressClick}
              ref={progressBarRef}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                style={{ width: `${(progress / duration) * 100 || 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform"></div>
              </div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold font-mono tracking-wider">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Bottom: Controls */}
          <div className="flex items-center justify-between relative z-10 px-2 w-full">
            {/* Volume Control */}
            <div className="relative group/volume flex items-center min-w-[32px]">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              {/* Expandable Volume Slider */}
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-out flex items-center ml-1">
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-8">
              <button 
                onClick={handlePrev}
                disabled={songs.length === 0}
                className="text-slate-400 hover:text-white disabled:opacity-50 transition-transform hover:scale-110 active:scale-95"
              >
                <SkipBack size={22} fill="currentColor" />
              </button>
              
              <button 
                onClick={togglePlay}
                disabled={songs.length === 0}
                className="w-14 h-14 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              
              <button 
                onClick={handleNext}
                disabled={songs.length === 0}
                className="text-slate-400 hover:text-white disabled:opacity-50 transition-transform hover:scale-110 active:scale-95"
              >
                <SkipForward size={22} fill="currentColor" />
              </button>
            </div>
            
            {/* Balanced spacing */}
            <div className="min-w-[32px] flex justify-end">
              <Music size={16} className="text-slate-600 opacity-20" />
            </div>
          </div>
        </div>

      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
