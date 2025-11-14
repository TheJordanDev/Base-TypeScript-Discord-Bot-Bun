import type { SongData } from '@/types';
import { video_basic_info, yt_validate, type InfoData } from 'play-dl';
import { youtubePattern } from './patterns';

export async function parseUrlToSong(url:string) : Promise<SongData[]> {
	const videoInfos : SongData[] = [];

	if (youtubePattern.test(url)) {
		const videoType : false | 'playlist' | 'video' | 'search' = yt_validate(url);
		if (videoType == 'video') {
			const videoInfo : InfoData = await video_basic_info(url);
			videoInfos.push({
				url: videoInfo.video_details.url,
				title: videoInfo.video_details.title,
				duration: videoInfo.video_details.durationInSec,
			});
		}
		else if (videoType == 'playlist') {
			console.log('Playlist');
		}
	}
	return videoInfos;
}