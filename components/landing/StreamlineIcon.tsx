/* Streamline Solar icon set used across the /new landing.
   All paths are normalised to viewBox -8 -8 256 256, so the parent
   sets the rendered size via width/height (or Tailwind h- and w-).
   Stroke colour is driven by the `color` prop so each section can
   tint icons to match its own accent. */

export type StreamlineIconName =
  | "card"
  | "clapperboard"
  | "graph"
  | "iphone"
  | "letter"
  | "money-bag"
  | "music-library"
  | "plane"
  | "presentation-graph"
  | "upload"
  | "users-group"
  | "verified-check";

type Props = {
  name: StreamlineIconName;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

export function StreamlineIcon({
  name,
  color = "currentColor",
  strokeWidth = 16,
  className = "h-6 w-6",
}: Props) {
  const common = {
    viewBox: "-8 -8 256 256" as const,
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
    className,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "card":
      return (
        <svg {...common}>
          <path
            d="M20 120c0 -37.7124 0 -56.5685 11.7157 -68.2843C43.4315 40 62.2876 40 100 40h40c37.712 0 56.569 0 68.284 11.7157C220 63.4315 220 82.2876 220 120c0 37.712 0 56.569 -11.716 68.284C196.569 200 177.712 200 140 200h-40c-37.7124 0 -56.5685 0 -68.2843 -11.716C20 176.569 20 157.712 20 120Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path d="M100 160H60" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
          <path d="M140 160h-15" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
          <path d="m20 100 200 0" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
        </svg>
      );
    case "clapperboard":
      return (
        <svg {...common}>
          <path
            d="M40 110h120c18.856 0 28.284 0 34.142 5.858C200 121.716 200 131.144 200 150v10c0 28.284 0 42.426 -8.787 51.213C182.426 220 168.284 220 140 220h-40c-28.2843 0 -42.4264 0 -51.2132 -8.787C40 202.426 40 188.284 40 160v-50Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path
            d="M40.0147 109.997c-4.838 -18.0558 -7.2569 -27.0835 -5.1764 -34.8481 1.3629 -5.0867 4.0409 -9.7249 7.7645 -13.4486 5.6841 -5.6841 14.7118 -8.103 32.7672 -12.941l70.03 -18.7644c6.732 -1.8039 10.098 -2.7058 13.047 -2.8991 12.107 -0.7936 23.501 5.7846 28.868 16.6671 1.307 2.65 2.209 6.0162 4.013 12.7485 0.601 2.2442 0.902 3.3662 0.966 4.349 0.264 4.036 -1.928 7.8339 -5.556 9.6228 -0.883 0.4356 -2.005 0.7363 -4.249 1.3376L40.0147 109.997Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path d="m147.005 29.4135 -6.378 53.4726" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
          <path d="m84.2196 46.2396 -6.3775 53.4727" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
        </svg>
      );
    case "graph":
      return (
        <svg {...common}>
          <path
            d="M20 120c0 -47.1405 0 -70.7107 14.6447 -85.3553C49.2893 20 72.8595 20 120 20c47.14 0 70.711 0 85.355 14.6447C220 49.2893 220 72.8595 220 120c0 47.14 0 70.711 -14.645 85.355C190.711 220 167.14 220 120 220c-47.1405 0 -70.7107 0 -85.3553 -14.645C20 190.711 20 167.14 20 120Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path
            d="m70 140 17.9689 -21.563c7.1205 -8.544 10.6807 -12.817 15.3641 -12.817 4.684 0 8.244 4.273 15.365 12.817l2.604 3.126c7.121 8.544 10.681 12.817 15.365 12.817 4.683 0 8.244 -4.273 15.364 -12.817L170 100"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case "iphone":
      return (
        <svg {...common}>
          <path
            d="M40 100c0 -37.7124 0 -56.5685 11.7157 -68.2843C63.4315 20 82.2876 20 120 20c37.712 0 56.569 0 68.284 11.7157C200 43.4315 200 62.2876 200 100v40c0 37.712 0 56.569 -11.716 68.284C176.569 220 157.712 220 120 220c-37.7124 0 -56.5685 0 -68.2843 -11.716C40 196.569 40 177.712 40 140v-40Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path d="M150 190H90" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
          <path
            d="m167.482 23.7744 -0.841 1.2617c-7.561 11.3408 -11.341 17.0115 -16.864 20.4426 -1.098 0.6822 -2.239 1.2928 -3.415 1.8279 -5.918 2.691 -12.733 2.691 -26.363 2.691 -13.63 0 -20.4454 0 -26.3631 -2.691 -1.1767 -0.5351 -2.3176 -1.1457 -3.4155 -1.8279 -5.5216 -3.4311 -9.3019 -9.1018 -16.8626 -20.4426l-0.8411 -1.2617"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case "letter":
      return (
        <svg {...common}>
          <path
            d="M20 120c0 -37.7124 0 -56.5685 11.7157 -68.2843C43.4315 40 62.2876 40 100 40h40c37.712 0 56.569 0 68.284 11.7157C220 63.4315 220 82.2876 220 120c0 37.712 0 56.569 -11.716 68.284C196.569 200 177.712 200 140 200h-40c-37.7124 0 -56.5685 0 -68.2843 -11.716C20 176.569 20 157.712 20 120Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path
            d="m60 80 21.589 17.9908C99.9553 113.296 109.139 120.949 120 120.949s20.045 -7.653 38.411 -22.9582L180 80"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case "money-bag":
      return (
        <svg {...common}>
          <path
            d="M20 140c0 -37.712 0 -56.5685 11.7157 -68.2843C43.4315 60 62.2876 60 100 60h40c37.712 0 56.569 0 68.284 11.7157C220 83.4315 220 102.288 220 140s0 56.569 -11.716 68.284C196.569 220 177.712 220 140 220h-40c-37.7124 0 -56.5685 0 -68.2843 -11.716C20 196.569 20 177.712 20 140Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path
            d="M160 60c0 -18.8562 0 -28.2843 -5.858 -34.1421C148.284 20 138.856 20 120 20c-18.856 0 -28.2843 0 -34.1421 5.8579C80 31.7157 80 41.1438 80 60"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path
            d="M120 173.333c11.046 0 20 -7.462 20 -16.666C140 147.462 131.046 140 120 140s-20 -7.462 -20 -16.667c0 -9.204 8.954 -16.666 20 -16.666m0 66.666c-11.046 0 -20 -7.462 -20 -16.666m20 16.666V180m0 -80v6.667m0 0c11.046 0 20 7.462 20 16.666"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case "music-library":
      /* Bag silhouette + handles only — no note inside. With the
         icon rendered at ~20px, an inner note made the strokes
         overlap into a noisy ball; the empty bag reads much
         cleaner at this size. */
      return (
        <svg {...common}>
          <path
            d="M195.62 70c2.286 -13.0477 -7.754 -25 -21.001 -25H65.3812C52.1347 45 42.0946 56.9523 44.3809 70"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path
            d="M174.999 45c0.284 -2.5908 0.426 -3.8865 0.428 -4.9565 0.023 -10.2363 -7.688 -18.8371 -17.866 -19.9293C156.497 20 155.194 20 152.588 20H87.4099c-2.6064 0 -3.9097 0 -4.9737 0.1142 -10.1778 1.0922 -17.8881 9.693 -17.8658 19.9292 0.0023 1.0701 0.1442 2.3656 0.4279 4.9566"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path
            d="M23.8351 137.93c-4.4603 -31.636 -6.6904 -47.4535 2.7881 -57.6917C36.1017 70 52.9758 70 86.7239 70h66.5521c33.748 0 50.622 0 60.101 10.2383 9.478 10.2382 7.248 26.0557 2.788 57.6917l-4.23 30c-3.498 24.809 -5.246 37.213 -14.218 44.642C188.745 220 175.512 220 149.046 220H90.9536c-26.4655 0 -39.6983 0 -48.6702 -7.428 -8.9719 -7.429 -10.7208 -19.833 -14.2186 -44.642l-4.2297 -30Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case "plane":
      return (
        <svg {...common}>
          <path
            d="m186.357 156.701 17.164 -51.493c14.995 -44.9838 22.492 -67.4758 10.619 -79.3485 -11.872 -11.8726 -34.364 -4.3753 -79.348 10.6193L83.2987 53.6432C46.9923 65.7453 28.8392 71.7964 23.6806 80.6698c-4.9075 8.4414 -4.9075 18.8671 0 27.3082 5.1586 8.874 23.3117 14.925 59.6181 27.027 5.8295 1.943 8.7443 2.915 11.1806 4.546 2.3611 1.58 4.3894 3.609 5.9697 5.97 1.631 2.436 2.603 5.351 4.546 11.18 12.102 36.307 18.153 54.46 27.027 59.618 8.441 4.908 18.867 4.908 27.308 0 8.874 -5.158 14.925 -23.311 27.027 -59.618Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path
            d="M162.116 88.4823c2.945 -2.9127 2.971 -7.6613 0.058 -10.6065 -2.912 -2.9451 -7.661 -2.9714 -10.606 -0.0587l10.548 10.6652Zm-55.49 54.8777 55.49 -54.8777 -10.548 -10.6652 -55.4893 54.8779 10.5473 10.665Z"
            fill={color}
          />
        </svg>
      );
    case "presentation-graph":
      return (
        <svg {...common}>
          <path d="M20 20h200" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
          <path
            d="m90 105 12.929 -12.9289c3.333 -3.3334 5 -5 7.071 -5 2.071 0 3.738 1.6666 7.071 5l5.858 5.8578c3.333 3.3331 5 5.0001 7.071 5.0001 2.071 0 3.738 -1.6669 7.071 -5.0001L150 85"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
          <path d="m120 210 0 -40" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
          <path d="m100 220 20 -10" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
          <path d="m140 220 -20 -10" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
          <path
            d="M200 20v85c0 30.641 0 45.962 -10.042 55.481C179.916 170 163.753 170 131.429 170h-22.858c-32.3245 0 -48.4869 0 -58.5289 -9.519C40 150.962 40 135.641 40 105V20"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path
            d="M30 150c0 28.284 0 42.426 8.7868 51.213C47.5736 210 61.7157 210 90 210h60c28.284 0 42.426 0 51.213 -8.787C210 192.426 210 178.284 210 150"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <path
            d="M120 160V30m0 0 40 43.75M120 30 80 73.75"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case "users-group":
      return (
        <svg {...common}>
          <path stroke={color} d="M50 60a40 40 0 1 0 80 0 40 40 0 1 0 -80 0" strokeWidth={strokeWidth} />
          <path
            d="M150 90c16.569 0 30 -13.4315 30 -30s-13.431 -30 -30 -30"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
          <path stroke={color} d="M20 170a70 40 0 1 0 140 0 70 40 0 1 0 -140 0" strokeWidth={strokeWidth} />
          <path
            d="M180 140c17.542 3.847 30 13.589 30 25 0 10.293 -10.137 19.229 -25 23.704"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    case "verified-check":
      return (
        <svg {...common}>
          <path
            d="M97.8133 38.9027c5.6387 -4.8053 8.4577 -7.2079 11.4057 -8.6168 6.818 -3.2588 14.744 -3.2588 21.562 0 2.948 1.4089 5.767 3.8115 11.406 8.6168 2.244 1.9125 3.366 2.8688 4.565 3.672 2.747 1.8413 5.832 3.1192 9.076 3.7597 1.416 0.2795 2.885 0.3968 5.825 0.6313 7.385 0.5893 11.077 0.884 14.158 1.9721 7.125 2.5168 12.73 8.1213 15.247 15.2466 1.088 3.0807 1.382 6.7732 1.972 14.1582 0.234 2.9393 0.351 4.4089 0.631 5.8243 0.64 3.2445 1.918 6.3296 3.76 9.0768 0.803 1.1984 1.759 2.3205 3.672 4.5647 4.805 5.6386 7.208 8.4586 8.617 11.4056 3.258 6.818 3.258 14.744 0 21.562 -1.409 2.948 -3.812 5.767 -8.617 11.406 -1.913 2.244 -2.869 3.366 -3.672 4.565 -1.842 2.747 -3.12 5.832 -3.76 9.077 -0.28 1.415 -0.397 2.885 -0.631 5.824 -0.59 7.385 -0.884 11.077 -1.972 14.158 -2.517 7.125 -8.122 12.73 -15.247 15.247 -3.081 1.088 -6.773 1.382 -14.158 1.972 -2.94 0.234 -4.409 0.352 -5.825 0.631 -3.244 0.641 -6.329 1.918 -9.076 3.76 -1.199 0.803 -2.321 1.759 -4.565 3.672 -5.639 4.805 -8.458 7.208 -11.406 8.617 -6.818 3.258 -14.744 3.258 -21.562 0 -2.948 -1.409 -5.7669 -3.812 -11.4057 -8.617 -2.2442 -1.913 -3.3664 -2.869 -4.5648 -3.672 -2.7471 -1.842 -5.8322 -3.119 -9.0767 -3.76 -1.4154 -0.279 -2.885 -0.397 -5.8243 -0.631 -7.385 -0.59 -11.0776 -0.884 -14.1582 -1.972 -7.1253 -2.517 -12.7299 -8.122 -15.2466 -15.247 -1.0881 -3.081 -1.3828 -6.773 -1.9721 -14.158 -0.2346 -2.939 -0.3518 -4.409 -0.6313 -5.824 -0.6405 -3.245 -1.9184 -6.33 -3.7597 -9.077 -0.8032 -1.199 -1.7595 -2.321 -3.672 -4.565 -4.8053 -5.639 -7.2079 -8.458 -8.6169 -11.406 -3.2587 -6.818 -3.2587 -14.744 0 -21.562 1.409 -2.948 3.8116 -5.767 8.6169 -11.4056 1.9125 -2.2442 2.8688 -3.3663 3.672 -4.5647 1.8413 -2.7472 3.1192 -5.8323 3.7597 -9.0768 0.2795 -1.4154 0.3967 -2.885 0.6313 -5.8243 0.5893 -7.385 0.884 -11.0775 1.9721 -14.1582 2.5167 -7.1253 8.1213 -12.7298 15.2466 -15.2466 3.0806 -1.0881 6.7732 -1.3828 14.1582 -1.9721 2.9393 -0.2345 4.4089 -0.3518 5.8243 -0.6313 3.2445 -0.6405 6.3296 -1.9184 9.0767 -3.7597 1.1985 -0.8032 2.3206 -1.7595 4.5648 -3.672Z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <path
            d="m85 125 20 20 50 -50"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    default:
      return null;
  }
}
