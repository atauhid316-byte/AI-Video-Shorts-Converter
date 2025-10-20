export interface ShortClip {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  description: string;
  captions: {
    en: string;
    hi: string;
  };
}