var
END_POINTS=['https://android.googleapis.com/gcm/send/','https://updates.push.services.mozilla.com/wpush/v1/'],
BROWSERS=['chrome','moz'],
createDevice=function(devices,os,token){
	devices.create(null,{
		data:{
			os:os,
			token:token
		},
		success:function(){
			console.log('create device success',arguments)
		},
		error:function(){
			console.error('create device error',arguments)
		}
	})
}

return {
	deps:{
		path:'text',
		devices:'models',
		safariPushId:'text',
		safariServiceURL:'text',
		safariData:'map'
	},
	create:function(deps,params){
		if (deps.safariPushId && window.safari && window.safari.pushNotification){
			var
			safariPush=window.safari.pushNotification,
			checkRemotePermission = function(permissionData){
				switch(permissionData.permission){
				case 'default':
					// This is a new web service URL and its validity is unknown.
					safariPush.requestPermission(
						deps.safariServiceURL,
						deps.safariPushId,
						deps.safariData,
						checkRemotePermission         // The callback function.
					)
					break
				case 'denied':
					// The user said no.
					console.warn('permission rejected')
					break
				case 'granted':
					// The web service URL is a valid push provider, and the user said yes.
					// permissionData.deviceToken is now available to use.
					console.warn('permission granted:'+permissionData.deviceToken)
					createDevice(deps.devices,'safari',permissionData.deviceToken)
					break
				}
			} 
			checkRemotePermission(safariPush.permission(deps.safariPushId))
		} else if (deps.path && navigator.serviceWorker){
			var worker=navigator.serviceWorker
			worker.register(deps.path).then(function(reg){
				worker.ready.then(function(reg){
					reg.pushManager.subscribe({userVisibleOnly:true}).then(function(sub){
						var os=sub.endpoint,token
						for(var i=0,d,n; d=END_POINTS[i]; i++){
							n=os.indexOf(d)
							if (-1===n) continue
							token=os.substr(d.length)
							os=BROWSERS[i]
							break
						}
						if (!token) return console.error('unknown endpoint',os)
						createDevice(deps.devices,os,token)
					})
				})
			}).catch(console.error)
		}else{
			this.slots={}
		}
	},
	slots:{
	}
}
