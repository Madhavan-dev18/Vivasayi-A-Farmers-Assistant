import { useLanguage } from '@/context/LanguageContext';

export function Logo() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 p-2">
      <svg
        width="40"
        height="40"
        viewBox="0 0 250 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
      >
        <defs>
          <linearGradient
            id="saffron-grad"
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FF9933" />
            <stop offset="100%" stopColor="#FF9933" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="green-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#138808" stopOpacity="0" />
            <stop offset="100%" stopColor="#138808" />
          </linearGradient>
          <clipPath id="circle-clip">
            <circle cx="125" cy="125" r="120" />
          </clipPath>
        </defs>

        <g clipPath="url(#circle-clip)">
          {/* Saffron Stripe */}
          <rect
            x="0"
            y="0"
            width="250"
            height="83.33"
            fill="#FF9933"
            fillOpacity="0.8"
          />

          {/* White Stripe */}
          <rect x="0" y="83.33" width="250" height="83.33" fill="#FFFFFF" />

          {/* Green Stripe - replaced with plants */}
          <rect
            x="0"
            y="166.66"
            width="250"
            height="83.33"
            fill="#138808"
            fillOpacity="0.8"
          />

          {/* Plant Silhouettes */}
          <path
            d="M10 185 C 12 175, 15 170, 20 170 C 25 170, 28 175, 30 185 L 32 195 L 35 180 C 38 170, 40 168, 45 172 C 50 176, 52 185, 50 195 M60 195 C 58 185, 62 180, 65 180 C 68 180, 70 185, 72 195 M80 195 C 78 180, 82 175, 85 175 C 88 175, 90 180, 92 195 M100 195 C 98 170, 102 165, 105 165 C 108 165, 110 170, 112 195 M120 195 C 118 180, 122 175, 125 175 C 128 175, 130 180, 132 195 M140 195 C 138 170, 142 165, 145 165 C 148 165, 150 170, 152 195 M160 195 C 158 180, 162 175, 165 175 C 168 175, 170 180, 172 195 M180 195 C 178 170, 182 165, 185 165 C 188 165, 190 170, 192 195 M200 195 C 198 180, 202 175, 205 175 C 208 175, 210 180, 212 195 M220 195 C 218 170, 222 165, 225 165 C 228 165, 230 170, 232 195"
            fill="#107C08"
            stroke="#107C08"
            strokeWidth="2"
            transform="translate(0, 30)"
          />
          <path
            d="M5 190 C 7 180, 10 175, 15 175 C 20 175, 23 180, 25 190 M30 190 C 28 175, 32 170, 35 170 C 38 170, 40 175, 42 190 M50 190 C 48 170, 52 165, 55 165 C 58 165, 60 170, 62 190 M70 190 C 68 175, 72 170, 75 170 C 78 170, 80 175, 82 190 M90 190 C 88 165, 92 160, 95 160 C 98 160, 100 165, 102 190 M110 190 C 108 175, 112 170, 115 170 C 118 170, 120 175, 122 190 M130 190 C 128, 165, 132, 160, 135, 160 C 138, 160, 140, 165, 142, 190 M150, 190 C 148, 175, 152, 170, 155, 170 C 158, 170, 160, 175, 162, 190 M170, 190 C 168, 165, 172, 160, 175, 160 C 178, 160, 180, 165, 182, 190 M190, 190 C 188, 175, 192, 170, 195, 170 C 198, 170, 200, 175, 202, 190 M210, 190 C 208, 165, 212, 160, 215, 160 C 218, 160, 220, 165, 222, 190 M230, 190 C 228, 175, 232, 170, 235, 170 C 238, 170, 240, 175, 242, 190"
            fill="#138808"
            stroke="#138808"
            strokeWidth="1.5"
            transform="translate(0, 45)"
          />
          <path
            d="M 25,180 C 22,175 25,170 30,170 C 35,170 38,175 35,180 L 30,195 Z M 55,180 C 52,175 55,170 60,170 C 65,170 68,175 65,180 L 60,195 Z M 85,180 C 82,175 85,170 90,170 C 95,170 98,175 95,180 L 90,195 Z M 115,180 C 112,175 115,170 120,170 C 125,170 128,175 125,180 L 120,195 Z M 145,180 C 142,175 145,170 150,170 C 155,170 158,175 155,180 L 150,195 Z M 175,180 C 172,175 175,170 180,170 C 185,170 188,175 185,180 L 180,195 Z M 205,180 C 202,175 205,170 210,170 C 215,170 218,175 215,180 L 210,195 Z"
            fill="#34A853"
            transform="translate(0, 48)"
          />

          {/* Ashoka Chakra */}
          <circle cx="125" cy="125" r="30" stroke="#000080" strokeWidth="3" fill="none" />
          <circle cx="125" cy="125" r="3" fill="#000080" />
          {[...Array(24)].map((_, i) => (
            <line
              key={i}
              x1="125"
              y1="125"
              x2="125"
              y2="95"
              stroke="#000080"
              strokeWidth="2.5"
              transform={`rotate(${i * 15}, 125, 125)`}
            />
          ))}
        </g>
      </svg>
      <h2 className="font-headline text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
        {t('AppShell.logo')}
      </h2>
    </div>
  );
}
