# Spotify Sync audio-response research

## Findings

ULLeds captures desktop audio locally with a Web Audio `AnalyserNode` using a 2048-point FFT. The analyzer measures bass, mids, treble, a 12-band spectrum, spectral-flux onsets, and short drop impacts. The color generator uses these signals to move and brighten the artwork palette. Genre hints come from a title/artist catalog lookup, with optional Windows media-session genres as a fallback; ULLeds does not classify genres from audio.

Librosa's documented onset-strength method measures positive spectral changes between adjacent frames (spectral flux). Its beat tracker then estimates tempo from onset correlation and selects peaks consistent with that tempo. This supports separating fast onset response from slower band-energy tracking rather than treating average bass level as a beat. Essentia's streaming rhythm extractor can estimate beats, BPM, and confidence, but requires 44.1 kHz input; ULLeds currently uses the sample rate reported by its audio context, so adopting it would require resampling or a different implementation.

Windows' `GlobalSystemMediaTransportControlsSessionMediaProperties` includes a `Genres` property, but its presence in the API does not guarantee Spotify supplies values. ULLeds reads that optional property from the active media session. For missing genres, it queries Apple's public iTunes Search API by title and artist, and accepts only matching catalog results. Spotify's Web API documentation marks both track audio features (including tempo, energy, danceability, and valence) and artist genres as deprecated, so they are not a dependable source for automatic genre behavior.

## Recommendation

Keep analysis on-device and dependency-free. Preserve fast changes in the live spectrum, compute onset strength separately from smoothed bass/mid/treble envelopes, and use short, thresholded transients to accent the existing artwork palette rather than generating random flashes. A rolling baseline and refractory period can distinguish a strong kick/drop from noisy frame-to-frame changes. Track insights show the matched catalog genre, falling back to Windows media-session genres when the lookup has no match. The compatibility genre-detector API intentionally returns no guess: spectral energy and transient activity cannot reliably identify semantic genres.

An actual tempo-synchronized beat tracker needs onset history and confidence, not just a single FFT frame. This should be a separate follow-up if onset-driven accents still fail the user's listening test. Spectral energy and transient activity cannot reliably distinguish semantic genres such as pop, rock, or rap; a trained local model or reliable catalog metadata would be needed for dependable classification.

## Sources

- [W3C Web Audio API: AnalyserNode](https://www.w3.org/TR/webaudio-1.1/#AnalyserNode) — standardized time- and frequency-domain analysis.
- [librosa: onset strength](https://librosa.org/doc/0.11.0/generated/librosa.onset.onset_strength.html) — spectral-flux onset-strength definition.
- [librosa: beat tracking](https://librosa.org/doc/0.11.0/generated/librosa.beat.beat_track.html) — onset measurement, tempo estimation, and tempo-consistent peak selection.
- [Essentia: streaming RhythmExtractor2013](https://essentia.upf.edu/reference/streaming_RhythmExtractor2013.html) — streaming beat/BPM/confidence outputs and 44.1 kHz requirement.
- [Microsoft: GlobalSystemMediaTransportControlsSessionMediaProperties](https://learn.microsoft.com/en-us/uwp/api/windows.media.control.globalsystemmediatransportcontrolssessionmediaproperties?view=winrt-26100) — Windows media metadata properties, including `Genres`.
- [Apple: iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) — public catalog search used for title/artist genre lookup.
- [Spotify: Get Track's Audio Features](https://developer.spotify.com/documentation/web-api/reference/get-audio-features) — documents tempo, energy, danceability, valence, and marks the endpoint deprecated.
- [Spotify: Get Artist](https://developer.spotify.com/documentation/web-api/reference/get-an-artist) — marks artist genres deprecated.
