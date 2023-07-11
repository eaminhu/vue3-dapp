<template>
    <div class='page-wrap'>
        <!-- <h1 class="text-purple-600">Web3.js DEMO</h1> -->
        网络 &nbsp;&nbsp;
        <el-select
            ref='networkSelectRef'
            v-model='networkId'
            clearable
            filterable
            placeholder='请选择'
            @change='switchNetwork'
        >
            <el-option
                v-for='(value, name) in networkConfigs'
                :key='value'
                :label='value.name'
                :value='name'
                width='100'
            >
                <img
                    alt=''
                    class='icon-network'
                    :src='value.networkLogoPath'
                    srcset=''
                />
                {{ value.name }}
            </el-option>
        </el-select>
        <div>
            <button class='oper-btn' @click='handleWalletConnect'>
                连接钱包
            </button>

            <button class='oper-btn' @click='getAccountAssets'>
                获取最新余额
            </button>
            <button class='oper-btn' @click='transfer'>
                转账
            </button>
            <button class='oper-btn' @click='getABI'>
                获取 ABI 文件
            </button>
               
            <button class='oper-btn' @click='addToken'>
                添加代币到小狐狸钱包
            </button>
            <button class='oper-btn' @click='close'>
                断开钱包
            </button>
        </div>
        <div>
            <button class='oper-btn' @click='sign'>
                签名
            </button>
        </div>
        <div class='w-6/12 mr-auto ml-auto mt-9'>
            <el-input
                v-model='sendData'
                maxlength='5000'
                placeholder='请输入data'
                rows='8'
                show-word-limit
                type='textarea'
            />
            <button class='oper-btn' @click='sendTransaction'>
                发送交易
            </button>
        </div>

        <div v-loading='loading' class='result'>
            <p>
                Address:
                {{ userAddress }}
            </p>
            <p>balance: {{ assets }}</p>
            <p>networkId: {{ networkId }}</p>
            <p>chainId: {{ chainId }}</p>
            <p>signature: {{ signature }}</p>
            <p>
                TxHASH:
                <a
                    class='text-blue-600'
                    :href="'https://ropsten.etherscan.io/tx/' + output"
                    target='_blank'
                >
                    {{ output }}
                </a>
            </p>
            <p>ABI：{{ abi }}</p>
        </div>
    </div>

    <el-dialog v-model='dialogTableVisible' title='转账' width='30%'>
        <el-form-item label='钱包地址' :label-width='100'>
            <el-input v-model='toAccount' autocomplete='off' />
        </el-form-item>
        <el-form-item label='金额' :label-width='100'>
            <el-input v-model='amount' autocomplete='off' type='number' />
        </el-form-item>
        <template #footer>
            <span class='dialog-footer'>
                <el-button @click='dialogTableVisible = false'>
                    取消
                </el-button>
                <el-button
                    type='primary'
                    @click='handleTransfer'
                >
                    确定
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import Web3, { utils } from 'web3'
import Web3Modal from 'web3modal'
import useWallet from '../hooks/useWallte'
import { getChainData } from '@/web3/tools'
import { providerOptions } from '@/web3/config'
import networkConfigs from '../config/networkConfigs'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import axios from 'axios'

const {
    onConnect,
    connected,
    web3,
    userAddress,
    chainId,
    networkId,
    resetApp,
    assets,
    loading,
    getAccountAssets
} = useWallet()

const output = ref('')
const networkName = ref(networkId.value)
const networkSelectRef = ref(null)
const dialogTableVisible = ref(false)
const toAccount = ref('0xEd0f4bf5e21151dA45a1CA66Df30cbf695d92fBc')
const amount = ref('')
const abi = ref('')
const signature = ref('')
const sendData = ref('0xd9627aa40000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000015817a685f9a1645c00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f869584cd000000000000000000000000100000000000000000000000000000000000001100000000000000000000000000000000000000000000001c2e352fd761f763ab')
//onConnect()

const handleWalletConnect = async function () {
    await onConnect()
}
const close = async () => {
    resetApp()
}

const getAccounts = async () => {
    const accounts = await web3.value.eth.getCoinbase()
    console.log(accounts)
}

const handleTransfer = () => {
    var message = {
        to: toAccount.value,
        value: utils.toWei(amount.value),
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
            dialogTableVisible.value = false
            console.log('hash------------', hash)
        })
        .on('receipt', function (receipt) {
            console.log('receipt------------', receipt)
            ElNotification({
                title: '转账成功',
                dangerouslyUseHTMLString: true,
                message: `<a class='text-blue-600' target="_blank" href="https://ropsten.etherscan.io/tx/${receipt.transactionHash}">${receipt.transactionHash}</a>`,
                type: 'success'
            })
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log('区块确认高度-----------', confirmationNumber, receipt)
        })
        .on('error', (error) => {
            console.log('error----------', error)
        })
}
const transfer = () => {
    if (!web3.value) return ElMessage.warning('未连接钱包')
    dialogTableVisible.value = true
}

//切换网络
const switchNetwork = (value) => {
    
    const chainId = utils.toHex(value)

    window.ethereum &&
        window.ethereum
            .request({
                method: 'wallet_switchEthereumChain',
                params: [
                    {
                        chainId
                    }
                ]
            })
            .then(() => {
                networkSelectRef.value.blur()
                ElMessage.success('网络切换成功')
            })
            .catch((e) => {
                ElMessageBox.confirm(e.message, {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    addNetwork(value)
                })
            })
}

//添加网络
const addNetwork = (value) => {
    const { name, publicJsonRPCUrl } = networkConfigs[value]
    const chainId = utils.toHex(value)
    window.ethereum &&
        window.ethereum
            .request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId,
                        chainName: name,
                        // nativeCurrency: {
                        //     name: 'BNB',
                        //     symbol: 'BNB',
                        //     decimals: 18,
                        // },
                        rpcUrls: publicJsonRPCUrl
                        // blockExplorerUrls: ['https://bscscan.com/'],
                    }
                ]
            })
            .then(() => {
                console.log('网络添加成功')
            })
            .catch((e) => {})
}

const addToken = () => {
    const params = {
        type: 'ERC20',
        options: {
            address: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
            symbol: 'RIF',
            decimals: 18,
            image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3701.png'
        }
    }

    window.ethereum
        .request({ method: 'wallet_watchAsset', params })
        .then(() => ElMessage.success('添加代币成功'))
        .catch((error) => console.log(error))
}

const getMarketHelpData = (marketName) => {
    const testChains = [
        'Kovan',
        'Rinkeby',
        'Ropsten',
        'Mumbai',
        'Fuji',
        'Testnet'
    ]
    const arrayName = marketName.split(' ')
    const testChainName = arrayName.filter((el) => testChains.indexOf(el) > -1)
    const marketTitle = arrayName
        .filter((el) => !testChainName.includes(el))
        .join(' ')
    return {
        name: marketTitle,
        testChainName: testChainName[0]
    }
}

const getABI = () => {
    //获取abi文件
    var api =
        'https://api.etherscan.io/api?module=contract&action=getabi&address=0xdac17f958d2ee523a2206206994597c13d831ec7'
    axios
        .get(api)
        .then((res) => {
            //请求成功的回调函数
            if (res.status === 200) {
                abi.value = JSON.parse(res.data.result)
            }
        })
        .catch((err) => {
            //请求失败的回调函数
            console.log(err)
        })
}

//发送交易
const sendTransaction = ()  => {
    if (!web3.value) return ElMessage.warning('未连接钱包')
    var message = {
        from: userAddress.value,
        data: sendData.value
    }

    web3.value.eth
        .sendTransaction(message)
        .on('transactionHash', function (hash) {
            output.value = hash
            dialogTableVisible.value = false
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

//签名
const sign = async () => {
    if (!web3.value) return ElMessage.warning('未连接钱包')
    const address = utils.toChecksumAddress(userAddress.value);

    const message = "sign " + new Date().getTime();

    signature.value = await web3.value.eth.personal.sign(message, address);
    
    console.log('sign------------', signature)
    // signature.then((res) => {});
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.oper-btn {
    @apply mt-10 mr-2 shadow px-5 h-7 font-thin bg-yellow-300 rounded-sm;
}
.icon-network {
    display: inline-block;
    @apply mr-1;
}
.result {
    @apply bg-gray-50 shadow-xl mt-10 p-10 text-left w-6/12 m-auto border rounded-lg;
    word-break: break-all;
}
</style>
