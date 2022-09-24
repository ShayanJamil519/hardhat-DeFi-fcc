const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("./getWeth")

async function main() {
    // the protocol treats everything in ERC20 token
    await getWeth()
    const { deployer } = await getNamedAccounts()
        // abi, token
        // Lending Pool Address Provider :   0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool Address : ${lendingPool.address}`)
        // Approve then deposit collateral
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log("Depositing WETH...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Desposited!")

    // availableBorrowsETH ?? What the conversion rate of DAI is ?
    // Borrowing Time
    // How much we have borrowed, how much we have in collateral, how much we can borrow
    // Getting your borrowing stats
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)
    const daiPrice = await getDaiPrice()
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
    console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`)
        // Finally borrowing DAI after necessary steps
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    )
    await getBorrowUserData(lendingPool, deployer)
    await repay(
        amountDaiToBorrowWei,
        daiTokenAddress,
        lendingPool,
        deployer
    )
    await getBorrowUserData(lendingPool, deployer)


}


async function getBorrowUserData(lendingPool, account) {
    const {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH
    } = await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`)
    return { availableBorrowsETH, totalDebtETH }
}

async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.address, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repaid!")
}


async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log("You've borrowed!")
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt( // Since we are not sending any transaction here so no need of signer / deployer here
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

async function getLendingPool(account) {

    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider", "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", account)
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool

}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    txResponse = await erc20Token.approve(spenderAddress, amountToSpend)
    await txResponse.wait(1)
    console.log("Approved!")
}



main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })




// OUTPUT Of DeFi Transactions

//     $ "F:\Blockchain\Hardhat FCC\hardhat-defi-fcc\node_modules\.bin\hardhat" run .\scripts\aaveBorrow.js
// Got 20000000000000000 WETH
// LendingPool Address : 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
// Approved!
// Depositing WETH...
// Desposited!
// You have 20000000000000000 worth of ETH deposited.
// You have 0 worth of ETH borrowed.
// You can borrow 16500000000000000 worth of ETH.
// The DAI/ETH price is 749968773329958
// You can borrow 20.900870219437245 DAI
// You've borrowed!
// You have 20000000159515767 worth of ETH deposited.
// You have 15675000000000000 worth of ETH borrowed.
// You can borrow 825000131600508 worth of ETH.
// Approved!
// Repaid!
// You have 20000000272506102 worth of ETH deposited.
// You have 931143581 worth of ETH borrowed.
// You can borrow 16499999293673953 worth of ETH.
// Done in 58.28s.