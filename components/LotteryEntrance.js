import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    // console.log(parseInt(chainIdHex))
    const chainId = parseInt(chainIdHex)
    // console.log(chainId)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    // console.log(raffleAddress)
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()
    const {
        runContractFunction: enterRaffle,
        isFetching,
        isLoading,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayerSFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()

        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayerSFromCall)
        setRecentWinner(recentWinnerFromCall)
        // console.log(entranceFee)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            //icon, // <any, string | React.JSXElementConstructor<any>>,
        })
    }

    return (
        <div className="p-10">
            Please Press Enter Raffle To Play!
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-400  :bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto "
                        onClick={async function () {
                            await enterRaffle({
                                //enterRaffle是一个useWeb3Contract对象，来自于：import { useWeb3Contract } from "react-moralis"
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isFetching || isLoading}
                    >
                        {isFetching || isLoading ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH </div>
                    <div>Number of Players: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle Address Deteched!</div>
            )}
        </div>
    )
}
