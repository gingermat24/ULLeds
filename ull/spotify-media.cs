using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Media.Control;

internal static class SpotifyMedia
{
    private static int Main(string[] args)
    {
        try
        {
            Console.OutputEncoding = new UTF8Encoding(false);
            var statusOnly = args.Contains("--status", StringComparer.OrdinalIgnoreCase);
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

            if (statusOnly)
            {
                Console.WriteLine(session.GetPlaybackInfo().PlaybackStatus.ToString());
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
                if (buffer.Length < 1 || buffer.Length > 2 * 1024 * 1024)
                    throw new InvalidDataException("Spotify cover art is empty or exceeds 2 MB.");

                Console.WriteLine(
                    "{\"contentType\":\"" + EscapeJson(image.ContentType) +
                    "\",\"title\":\"" + EscapeJson(properties.Title) +
                    "\",\"artist\":\"" + EscapeJson(properties.Artist) +
                    "\",\"album\":\"" + EscapeJson(properties.AlbumTitle) +
                    "\",\"playbackStatus\":\"" + EscapeJson(session.GetPlaybackInfo().PlaybackStatus.ToString()) +
                    "\",\"data\":\"" + Convert.ToBase64String(buffer.ToArray()) + "\"}");
            }
            return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error.Message);
            return 1;
        }
    }

    private static string EscapeJson(string value)
    {
        var escaped = new StringBuilder();
        foreach (var character in value ?? String.Empty)
        {
            switch (character)
            {
                case '"': escaped.Append("\\\""); break;
                case '\\': escaped.Append("\\\\"); break;
                case '\b': escaped.Append("\\b"); break;
                case '\f': escaped.Append("\\f"); break;
                case '\n': escaped.Append("\\n"); break;
                case '\r': escaped.Append("\\r"); break;
                case '\t': escaped.Append("\\t"); break;
                default:
                    if (character < 0x20)
                        escaped.Append("\\u").Append(((int)character).ToString("x4"));
                    else
                        escaped.Append(character);
                    break;
            }
        }
        return escaped.ToString();
    }
}
