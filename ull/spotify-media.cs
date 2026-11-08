using System;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Media.Control;

internal static class SpotifyMedia
{
    private static int Main()
    {
        try
        {
            var manager = GlobalSystemMediaTransportControlsSessionManager
                .RequestAsync().AsTask().GetAwaiter().GetResult();
            var sessions = manager.GetSessions()
                .Where(candidate => candidate.SourceAppUserModelId.IndexOf(
                    "spotify", StringComparison.OrdinalIgnoreCase) >= 0)
                .ToArray();
            var session = sessions.FirstOrDefault(candidate =>
                candidate.GetPlaybackInfo().PlaybackStatus ==
                GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing)
                ?? sessions.FirstOrDefault();
            if (session == null)
            {
                Console.WriteLine("NONE");
                return 0;
            }

            var properties = session.TryGetMediaPropertiesAsync().AsTask().GetAwaiter().GetResult();
            if (properties == null || properties.Thumbnail == null)
            {
                Console.WriteLine("NONE");
                return 0;
            }

            var image = properties.Thumbnail.OpenReadAsync().AsTask().GetAwaiter().GetResult();
            if (image.Size < 1 || image.Size > 2 * 1024 * 1024)
                throw new InvalidDataException("Spotify cover art is empty or exceeds 2 MB.");

            using (var source = image.AsStreamForRead())
            using (var buffer = new MemoryStream())
            {
                source.CopyTo(buffer);
                Console.WriteLine(image.ContentType);
                Console.WriteLine(Convert.ToBase64String(buffer.ToArray()));
            }
            return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error.Message);
            return 1;
        }
    }
}
