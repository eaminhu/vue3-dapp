<template>
    <div class='text-center mb-10'>
        <a href='https://web3js.readthedocs.io/en/v1.7.3/'> 
            <img
                alt='Vue logo'
                class='m-auto'
                src='https://pic3.zhimg.com/v2-ca746f5b73260a22ba8bc8e1cf9e4fc6_1440w.jpg?source=172ae18b'
            />
        </a>
    </div>

    <WalletEample msg='Welcome to Your Vue.js App' />
</template>

<script>
import WalletEample from './components/WalletEample.vue'

export default {
    name: 'App',
    components: {
        WalletEample
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
