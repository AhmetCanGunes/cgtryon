import React from 'react';

interface ModelSilhouetteProps {
  gender: string;
  pose?: string;
}

const ModelSilhouette: React.FC<ModelSilhouetteProps> = ({ gender, pose }) => {
  const isFemale = gender === 'Kadin';
  const isMale = gender === 'Erkek';

  // Female silhouette SVG path
  const femalePath = `
    M 100 40
    C 85 40, 75 50, 75 65
    C 75 80, 85 90, 100 90
    C 115 90, 125 80, 125 65
    C 125 50, 115 40, 100 40
    M 100 95
    C 90 95, 85 100, 85 105
    L 82 140
    C 80 145, 75 155, 70 180
    C 65 205, 60 230, 58 260
    C 55 290, 60 320, 65 350
    L 70 380
    L 60 380
    L 55 400
    C 55 420, 60 440, 65 450
    L 75 450
    L 80 440
    L 85 450
    L 95 450
    L 95 380
    L 100 350
    L 105 380
    L 105 450
    L 115 450
    L 120 440
    L 125 450
    L 135 450
    C 140 440, 145 420, 145 400
    L 140 380
    L 130 380
    L 135 350
    C 140 320, 145 290, 142 260
    C 140 230, 135 205, 130 180
    C 125 155, 120 145, 118 140
    L 115 105
    C 115 100, 110 95, 100 95
  `;

  // Male silhouette SVG path
  const malePath = `
    M 100 35
    C 82 35, 70 48, 70 65
    C 70 82, 82 95, 100 95
    C 118 95, 130 82, 130 65
    C 130 48, 118 35, 100 35
    M 100 100
    C 88 100, 80 105, 80 115
    L 75 130
    C 65 140, 55 160, 50 190
    L 48 220
    L 35 220
    L 32 240
    L 40 260
    L 55 260
    L 58 240
    L 60 220
    C 60 250, 62 280, 65 310
    L 68 350
    L 70 380
    L 60 380
    L 58 400
    C 58 430, 62 450, 68 460
    L 82 460
    L 85 450
    L 88 460
    L 95 460
    L 95 380
    L 98 340
    L 100 320
    L 102 340
    L 105 380
    L 105 460
    L 112 460
    L 115 450
    L 118 460
    L 132 460
    C 138 450, 142 430, 142 400
    L 140 380
    L 130 380
    L 132 350
    L 135 310
    C 138 280, 140 250, 140 220
    L 142 240
    L 145 260
    L 160 260
    L 168 240
    L 165 220
    L 152 220
    L 150 190
    C 145 160, 135 140, 125 130
    L 120 115
    C 120 105, 112 100, 100 100
  `;

  // Neutral silhouette (simpler form)
  const neutralPath = `
    M 100 40
    C 82 40, 72 52, 72 68
    C 72 84, 82 96, 100 96
    C 118 96, 128 84, 128 68
    C 128 52, 118 40, 100 40
    M 100 100
    C 88 100, 82 108, 82 118
    L 78 150
    C 72 175, 68 200, 66 230
    C 64 260, 66 290, 70 320
    L 75 360
    L 78 400
    L 68 400
    L 65 420
    C 65 445, 70 460, 78 465
    L 90 465
    L 95 455
    L 100 465
    L 105 455
    L 110 465
    L 122 465
    C 130 460, 135 445, 135 420
    L 132 400
    L 122 400
    L 125 360
    L 130 320
    C 134 290, 136 260, 134 230
    C 132 200, 128 175, 122 150
    L 118 118
    C 118 108, 112 100, 100 100
  `;

  const getSilhouettePath = () => {
    if (isFemale) return femalePath;
    if (isMale) return malePath;
    return neutralPath;
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg
        viewBox="0 0 200 500"
        className="w-24 h-48 opacity-30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d={getSilhouettePath()}
          className="text-[var(--studio-text-muted)]"
        />
      </svg>
    </div>
  );
};

export default ModelSilhouette;
