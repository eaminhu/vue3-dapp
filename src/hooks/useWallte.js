import { ref, reactive, getCurrentInstance, toRefs } from "vue";
import Web3, { utils } from "web3";
import Web3Modal from "web3modal";
import { getChainData } from "@/web3/tools";
import { providerOptions } from "@/web3/config";
import { ElMessage } from "element-plus";

const INITIAL_STATE = {
    web3: null,
    provider: null,
    userAddress: "",
    connected: false,
    chainId: 1,
    networkId: "1",
    loading: false,
};

export default function UseWallet() {
    const { ctx: _this } = getCurrentInstance();

    const walletObj = reactive({ ...INITIAL_STATE });
    const fetching = ref(false);
    const assets = ref(0);
    //https://github.com/Web3Modal/web3modal#web3modal
    const web3Modal = new Web3Modal({
        theme: "dark",
        network: getChainData(walletObj.chainId).network,
        cacheProvider: true,
        providerOptions,
    });
    // methods wallte.js
    const resetApp = async () => {
        const { web3 } = walletObj;
        if (web3 && web3.currentProvider && web3.currentProvider.close) {
            web3.currentProvider.close().then((res) => {
                console.log("close", res);
            });
        }

        web3Modal.clearCachedProvider();
        assets.value = 0;
        Object.keys(INITIAL_STATE).forEach((e) => {
            walletObj[e] = INITIAL_STATE[e];
        });
        _this.$forceUpdate();
    };

    //查询余额
    const getUserBalance = () => {
        if (!walletObj.web3) return ElMessage.warning("未连接钱包");
        walletObj.loading = true;
        return walletObj.web3.eth.getBalance(walletObj.userAddress).then((res) => {
            walletObj.loading = false;
            return utils.fromWei(res.toString(), "ether") || 0;
        })
    };

    const getAccountAssets = async () => {
    /* 新版的方式 */
        var web3Provider;
        if (window.ethereum) {
            web3Provider = window.ethereum;
            try {
                // 请求用户授权
                await window.ethereum.enable();
            } catch (error) {
                // 用户不授权时
                console.error("User denied account access");
            }
        } else if (window.web3) {
            // 老版 MetaMask Legacy dapp browsers...
            web3Provider = window.web3.currentProvider;
        } else {
            web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
        }
        const web3js = new Web3(web3Provider); //web3js就是你需要的web3实例

        web3js.eth.getAccounts(function (error, result) {
            if (!error) console.log(result); //授权成功后result能正常获取到账号了
        });

        // const acc = walletObj.web3.eth.getAccounts().then(console.log);

        // const aa = utils.toChecksumAddress(walletObj.userAddress);

        // const message = "abcde " + 1660628597846;

        // const signature = walletObj.web3.eth.personal.sign(message, aa);
        // signature.then((res) => {});

        // fetching.value = true;
        assets.value = await getUserBalance();
    };

    const subscribeProvider = async (provider) => {
        if (!provider.on) {
            return;
        }
        provider.on("close", () => {
            console.log("guanbi");
            resetApp();
        });
        provider.on("accountsChanged", async (accounts) => {
            // eslint-disable-next-line prefer-destructuring

            walletObj.userAddress = accounts[0];
            await getAccountAssets();
        });
        provider.on("chainChanged", async (chainId) => {
            const networkId = await walletObj.web3.eth.net.getId();
            walletObj.chainId = chainId;
            walletObj.networkId = networkId.toString();
            await getAccountAssets();
            _this.$forceUpdate();
        });
    };

    const onConnect = async () => {
        const provider = await web3Modal.connect();
        console.log("provider", provider);
        await subscribeProvider(provider);

        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();

        const address = accounts[0];

        const networkId = await web3.eth.net.getId();

        const chainId = await web3.eth.getChainId();

        walletObj.web3 = web3;
        walletObj.provider = provider;
        walletObj.connected = true;
        walletObj.userAddress = address;
        walletObj.chainId = chainId;
        walletObj.networkId = networkId.toString();
        await getAccountAssets();
    };

    return {
        ...toRefs(walletObj),
        fetching,
        assets,
        resetApp,
        getAccountAssets,
        web3Modal,
        // methods
        onConnect,
    };
}
