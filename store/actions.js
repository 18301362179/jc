// store/actions.js（修改后，保留地理位置获取，删除显隐相关逻辑）
import {
	queryBasePermissionNeed
} from "@/api/demo";

export default {
	fetchLotteryStatus({
		commit
	}) {
		return new Promise((resolve, reject) => {
			// 显示加载中
			uni.showLoading({
				title: '加载中...'
			});

			// 多端兼容的地理位置获取（H5用navigator，App/小程序用uni.getLocation）
			const getLocation = () => {
				return new Promise((locResolve, locReject) => {
					// #ifdef H5
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(
							(position) => {
								locResolve({
									latitude: position.coords.latitude,
									longitude: position.coords.longitude
								});
							},
							(error) => locReject(error)
						);
					} else {
						locReject(new Error('H5浏览器不支持地理位置'));
					}
					// #endif

					// #ifndef H5
					// App/小程序用uni.getLocation
					uni.getLocation({
						type: 'wgs84', // 标准GPS坐标
						success: (res) => {
							locResolve({
								latitude: res.latitude,
								longitude: res.longitude
							});
						},
						fail: (err) => locReject(err)
					});
					// #endif
				});
			};

			// 执行地理位置获取+请求（仅保留请求逻辑，删除显隐状态提交）
			getLocation()
				.then(({
					latitude,
					longitude
				}) => {
					return queryBasePermissionNeed({
						jd: longitude, // jd=经度，wd=纬度（参数对应正确）
						wd: latitude
					});
				})
				.then(res => {
					resolve(res); // 仅返回请求结果，删除显隐状态commit
				})
				.catch(err => {
					console.error('获取地理位置或请求失败：', err);
					reject(err); // 仅抛出错误，删除显隐状态commit
				})
				.finally(() => {
					uni.hideLoading();
				});
		});
	}
};