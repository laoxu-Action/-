import router from './router'
import store from './store'
// import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'
// import { includes } from 'core-js/core/array'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist
router.beforeEach(async (to,form,next)=>{
  document.title = getPageTitle(to.meta.title)
  NProgress.start()
  let token=store.state.user.token
  if(token){
    if(to.path === '/login'){
      next("/")
      NProgress.done()
    }else{
      let name=store.state.user.name
      if(name){
        next()
      }else{
        try {
          await store.dispatch("user/getInfo")
          next("/")
        } catch (error) {
          await store.dispatch('user/resetToken')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  }else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
