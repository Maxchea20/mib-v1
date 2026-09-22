import { Svg, Path, Circle, Rect } from "@react-pdf/renderer";

export type IconProps = {
  size?: number;
  color?: string;
};

const defaults = { size: 13, color: "#09233D" };

function base(size: number) {
  return { width: size, height: size, viewBox: "0 0 24 24" } as const;
}

export function PinIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <Circle cx={12} cy={9} r={2.2} fill={color} />
    </Svg>
  );
}

export function CheckIcon({ size = defaults.size, color = "#D9A62E" }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.4} fill="none" />
    </Svg>
  );
}

export function HomeIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 11l9-7 9 7M5 10v10h14V10" stroke={color} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

export function LayersIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
      />
    </Svg>
  );
}

export function SquareIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={3} y={3} width={18} height={18} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M3 3l18 18" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function RulerSquareIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x={3} y={3} width={18} height={18} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M3 8h3M3 13h3M3 18h3M8 21v-3M13 21v-3M18 21v-3" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function BedIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6M3 18h18M3 14h18M7 10V8a2 2 0 012-2h2a2 2 0 012 2v2"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
    </Svg>
  );
}

export function BathIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4zM4 12V8a2 2 0 012-2h1M7 6V4"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
    </Svg>
  );
}

export function SofaIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M4 13a2 2 0 012-2h12a2 2 0 012 2v4H4v-4zM4 17v2M20 17v2M6 11V8a2 2 0 012-2h8a2 2 0 012 2v3"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
    </Svg>
  );
}

export function CarIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M5 17h14M5 11l2-5h10l2 5M3 11h18v6H3v-6z" stroke={color} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

export function TruckIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 7h11v8H3zM14 10h4l3 3v2h-7v-5z" stroke={color} strokeWidth={1.8} fill="none" />
      <Circle cx={6} cy={18} r={2} stroke={color} strokeWidth={1.8} fill="none" />
      <Circle cx={17} cy={18} r={2} stroke={color} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

export function CompassIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M12 8l2.5 3.5L12 16l-2.5-4.5z" stroke={color} strokeWidth={1.4} fill="none" />
    </Svg>
  );
}

export function DocumentIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M6 3h9l5 5v13H6V3zM15 3v5h5" stroke={color} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

export function FlagIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M5 3v18M5 4h11l-2 4 2 4H5" stroke={color} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

export function FactoryIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M3 21V10l6 4v-4l6 4V7l6 4v10H3z"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
      />
      <Path d="M7 21v-4M13 21v-4M19 21v-4" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function ShopIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 9l1-5h16l1 5M4 9v11h16V9M9 20v-6h6v6" stroke={color} strokeWidth={1.7} fill="none" />
    </Svg>
  );
}

export function MapIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M9 3v16M15 5v16" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function TerrainIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 20l6-10 4 6 3-4 5 8H3z" stroke={color} strokeWidth={1.7} fill="none" />
    </Svg>
  );
}

export function ArrowUpDownIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M7 8l5-5 5 5M12 3v18M7 16l5 5 5-5" stroke={color} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

export function BoltIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

export function PlugIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M9 2v6M15 2v6M6 8h12v4a6 6 0 01-12 0V8zM12 18v4"
        stroke={color}
        strokeWidth={1.7}
        fill="none"
      />
    </Svg>
  );
}

export function ShieldCheckIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

export function PhoneIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.7a2 2 0 01-.4 2.1L8 9.9a16 16 0 006 6l1.4-1.4a2 2 0 012.1-.4c.9.3 1.8.5 2.7.6A2 2 0 0122 16.9z"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
      />
    </Svg>
  );
}

export function MailIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 6h18v12H3zM3 6l9 7 9-7" stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

export function BadgeIcon({ size = defaults.size, color = defaults.color }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M12 2l3 2h4v4l2 3-2 3v4h-4l-3 2-3-2H5v-4l-2-3 2-3V4h4z" stroke={color} strokeWidth={1.5} fill="none" />
      <Path d="M9.5 12l1.5 1.5 3-3" stroke={color} strokeWidth={1.5} fill="none" />
    </Svg>
  );
}