declare module "libheif-js/wasm-bundle" {
  export interface HeifImage {
    get_width(): number;
    get_height(): number;
    display(
      imageData: ImageData | { data: Uint8ClampedArray; width: number; height: number },
      callback: (displayData: any) => void,
    ): void;
  }

  export class HeifDecoder {
    decode(buffer: ArrayBuffer | Uint8Array): HeifImage[];
  }

  const libheif: {
    HeifDecoder: typeof HeifDecoder;
  };
  export default libheif;
}
