export const DEMO_PLAYLIST_NAME = "قائمة تجريبية";

/**
 * قائمة صغيرة لبثوث عامة مفتوحة (HLS) تعمل غالباً من المتصفح.
 * الغرض منها تجربة الواجهة فقط، وقد تتوقف أي قناة لاحقاً.
 */
export const DEMO_M3U = `#EXTM3U
#EXTINF:-1 tvg-id="AlJazeera.qa" tvg-logo="https://i.imgur.com/7bRVpnu.png" group-title="أخبار",الجزيرة
https://live-hls-apps-aja-fa.getaj.net/AJA/01.m3u8
#EXTINF:-1 tvg-id="Alarabiya.ae" tvg-logo="https://shahid.mbc.net/mediaObject/a4c125db-ede8-4970-9eed-963948c78651?height=auto&width=512&croppingPoint=&version=1&type=png" group-title="أخبار",العربية
https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8
#EXTINF:-1 tvg-id="DW.de" tvg-logo="https://i.imgur.com/8MRNFb9.png" group-title="أخبار",DW عربية
https://dwamdstream103.akamaized.net/hls/live/2015526/dwstream103/master.m3u8
#EXTINF:-1 tvg-id="France24.fr" group-title="أخبار",فرانس 24 عربي
https://live.france24.com/hls/live/2037222-b/F24_AR_HI_HLS/master_5000.m3u8
#EXTINF:-1 tvg-id="MBC1.ae" tvg-logo="https://i.imgur.com/CiA3plN.png" group-title="عام",MBC 1
https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-1/15cf99af5de54063fdabfefe66adc075/index.m3u8
#EXTINF:-1 tvg-id="NASA.us" group-title="علوم",ناسا TV
https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8
#EXTINF:-1 tvg-id="RedBullTV.at" group-title="ترفيه",ريد بُل TV
https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8
#EXTINF:-1 tvg-id="BigBuckBunny" group-title="أفلام",فيلم تجريبي — Big Buck Bunny
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
`;
