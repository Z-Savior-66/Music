import {
  type IAudioMetadata as iAudioMetadata,
} from 'music-metadata'

declare global {
  namespace S {
    namespace MusicMetadataModule {
      type IAudioMetadata = iAudioMetadata
    }
  }
}
