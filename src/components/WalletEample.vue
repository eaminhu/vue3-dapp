<template>
    <div class="hello text-black text-center mt-30 h-20 px-10 mt-20">
        <!-- <h1 class="text-purple-600">Web3.js DEMO</h1> -->
        <el-select v-model="a" value-key="" placeholder="" clearable filterable>
            <el-option
                v-for="item in 10"
                :key="item"
                :label="item"
                :value="item"
            >
            </el-option>
        </el-select>

        <button
            class="
                mt-10
                mr-2
                shadow
                px-5
                h-7
                font-thin
                bg-yellow-300
                rounded-sm
            "
            @click="handleWalletConnect"
        >
            连接钱包
        </button>
        <button
            class="
                mt-10
                mr-2
                shadow
                px-5
                h-7
                font-thin
                bg-yellow-300
                rounded-sm
            "
            @click="getAccount"
        >
            获取最新余额
        </button>

        <button
            class="
                mt-10
                mr-2
                shadow
                px-5
                h-7
                font-thin
                bg-yellow-300
                rounded-sm
            "
            @click="transfer"
        >
            转账
        </button>
        <button
            class="
                mt-10
                mr-2
                shadow
                px-5
                h-7
                font-thin
                bg-yellow-300
                rounded-sm
            "
            @click="close"
        >
            断开钱包
        </button>
        <button
            class="
                mt-10
                mr-2
                shadow
                px-5
                h-7
                font-thin
                bg-yellow-300
                rounded-sm
            "
            @click="close"
        >
            获取 AAVE 产品列表
        </button>
        <div class="mt-10 p-10 text-left w-1/2 m-auto border rounded-lg">
            <p>
                Address:
                {{ userAddress }}
            </p>
            <p>balance:{{ assets }}</p>
            <p>networkId: {{ networkId }}</p>
            <p>chainId: {{ chainId }}</p>
            <p>
                TxHASH:
                <a
                    :href="'https://ropsten.etherscan.io/tx/' + output"
                    target="_blank"
                    >{{ output }}</a
                >
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Web3, { utils } from 'web3'
import Web3Modal from 'web3modal'
import useWallet from '../hooks/useWallte'
import { getChainData } from '@/web3/tools'
import { providerOptions } from '@/web3/config'

const {
    onConnect,
    connected,
    web3,
    userAddress,
    chainId,
    networkId,
    resetApp,
    assets,
    getAccountAssets
} = useWallet()

const output = ref('')

const handleWalletConnect = async function () {
    await onConnect()
}
const close = async () => {
    resetApp()
}
const getAccount = () => {
    getAccountAssets()
}
const transfer = () => {
    const toAccount = '0xEd0f4bf5e21151dA45a1CA66Df30cbf695d92fBc'
    var message = {
        to: toAccount,
        value: web3.value.utils.toBN(100000000000000),
        from: userAddress.value
    }

    // web3.value.eth.sendTransaction(message, (err, res) => {
    //     if (!err) {
    //         output.value += res
    //     } else {
    //         output.value = 'Error'
    //     }
    // })

    web3.value.eth
        .sendTransaction(message)
        .on('transactionHash', function (hash) {
            output.value = hash
            console.log('hash------------', hash)
        })
        .on('receipt', function (receipt) {
            console.log('receipt------------', receipt)
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log('区块确认高度-----------', confirmationNumber, receipt)
        })
        .on('error', (error) => {
            console.log('error----------', error)
        })
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
</style>
