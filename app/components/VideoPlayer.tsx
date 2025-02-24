'use client'

type Props = {
  url: string
}

export default function VideoPlayer({ url }: Props) {
  return (
    <video
      src={url}
      controls
      className="w-full h-full"
      controlsList="nodownload"
    >
      Votre navigateur ne supporte pas la lecture de vidéos.
    </video>
  )
} 