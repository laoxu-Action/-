import { login, logout, getInfo } from '@/api/user'
import { resetRouter } from '@/router'


const state = {
  token: localStorage.getItem("token_key"),
  name: '',
  avatar: ''
}

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, {
      token: localStorage.getItem("token_key"),
      name: '',
      avatar: ''
    })
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // 登录
  async login({ commit }, userInfo) {
    const { username, password } = userInfo
    try {
      const rel = await login({ username: username.trim(), password: password })
      if (rel.code === 20000 || rel.code === 200) {
        commit('SET_TOKEN', rel.data.token)
        localStorage.setItem("token_key", rel.data.token)
      } else {
        this.$message.error("登录失败~~~")
      }
    } catch (error) {
      this.$message.error("登录请求失败~~~")
    }
  },
// 获取用户信息
  async getInfo({ commit, state }) {
    try {
      const rel = await getInfo(state.token)
      if (rel.code === 20000 || rel.code === 200) {
        const { data } = rel
        /* if (!data) {
          return Promise.reject('验证失败，请重新登录~~~')
        } */
        const { name, avatar } = data
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
      } else {
        this.$message.error("获取用户信息失败~~~")
      }
    } catch (error) {
      this.$message.error("请求获取用户信息失败~~~")
    }
  },
// 退出登录
  async logout({ commit, state }) {
    try {
      const rel = await logout(state.token)
      if (rel.code === 20000 || rel.code === 200) {
        localStorage.removeItem("token_key")
        resetRouter()
        commit('RESET_STATE')
      } else {
        this.$message.error("退出登录失败~~~")
      }
    } catch (error) {
      this.$message.error("请求退出登录失败~~~")
    }
  },
  resetToken({ commit }){
    localStorage.removeItem("token_key")
    commit('RESET_STATE')
  },

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

