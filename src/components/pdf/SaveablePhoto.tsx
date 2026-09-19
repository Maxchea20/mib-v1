import { Image, Link } from "@react-pdf/renderer";

type Props = {
  src: string;
  style?: any;
};

export default function SaveablePhoto({ src, style }: Props) {
  return (
    <Link src={src} style={style}>
      <Image src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </Link>
  );
}
