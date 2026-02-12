import { createContext, useContext, useState, ReactNode } from 'react';

export interface PlayerEpisode {
  episodeId: string;
  url: string;
  title: string;
  podcast: string;
}

interface PlayerContextType {
  selectedEpisode: PlayerEpisode | null;
  isPlaying: boolean;
  setSelectedEpisode: (episode: PlayerEpisode | null) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [selectedEpisode, setSelectedEpisode] = useState<PlayerEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <PlayerContext.Provider
      value={{
        selectedEpisode,
        isPlaying,
        setSelectedEpisode,
        setIsPlaying,
        togglePlayPause,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
