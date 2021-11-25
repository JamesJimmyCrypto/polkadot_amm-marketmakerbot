import { useState } from "react";
import { MdSwapVert } from "react-icons/md";
import "../styles.css";
import BoxTemplate from "./BoxTemplate";
import { PRECISION } from "../constants";

export default function SwapComponent(props) {
    const [coin, setCoin] = useState(["KAR", "KOTHI"]);
    const [amountFrom, setAmountFrom] = useState(0.0);
    const [amountTo, setAmountTo] = useState(0.0);
    const [slippageTolerance, setSlippageTolerance] = useState(0.5); // in percentage.
    const tolerance = [0.5, 1, 2, 5];
    const rev = () => {
        setCoin([...coin.reverse()]);
        getSwapEstimateAmountTo(amountFrom);
    };

    // Given amount of token in AmountFrom, estimates amount of token in amountTo, i.e. tokens recieved after swap
    const getSwapEstimateAmountTo = async (val) => {
        if (["", "."].includes(val)) return;
        if (props.contract !== null) {
            try {
                if (coin[0] === "KAR") {
                    await props.contract.query
                    .getSwapToken1Estimate(
                        props.activeAccount.address,
                        {value:0, gasLimit:-1},
                        val * PRECISION)
                    .then( res => res.output.toHuman())
                    .then( res => {
                        if(!res.Err) {
                            setAmountTo(res.Ok.replace(/,/g, '') / PRECISION);
                        } else {
                            console.log(res.Err);
                            alert(res.Err);
                        }
                    });
                } else {
                    await props.contract.query
                    .getSwapToken2Estimate(
                        props.activeAccount.address,
                        {value:0, gasLimit:-1},
                        val * PRECISION)
                    .then( res => res.output.toHuman())
                    .then( res => {
                        if(!res.Err) {
                            setAmountTo(res.Ok.replace(/,/g, '') / PRECISION);
                        } else {
                            console.log(res.Err);
                            alert(res.Err);
                        }
                    });
                }
                
            } catch (err) {
                alert(err);
                console.log(err);
            }
        }
    };

    // Given amount of tokens in amountTo, i.e. the amount recieved after swap, estimates the amount of tokens in amountFrom
    const getSwapEstimateAmountFrm = async (val) => {
        if (["", "."].includes(val)) return;
        if (props.contract !== null) {
            try {
                if (coin[0] === "KAR") {
                    await props.contract.query
                    .getSwapToken1EstimateGivenToken2(
                        props.activeAccount.address,
                        {value:0, gasLimit:-1},
                        val * PRECISION)
                    .then( res => res.output.toHuman())
                    .then( res => {
                        if(!res.Err) {
                            setAmountFrom(res.Ok.replace(/,/g, '') / PRECISION);
                        } else {
                            console.log(res.Err);
                            alert(res.Err);
                        }
                    });
                } else {
                    await props.contract.query
                    .getSwapToken2EstimateGivenToken1(
                        props.activeAccount.address,
                        {value:0, gasLimit:-1},
                        val * PRECISION)
                    .then( res => res.output.toHuman())
                    .then( res => {
                        if(!res.Err) {
                            setAmountFrom(res.Ok.replace(/,/g, '') / PRECISION);
                        } else {
                            console.log(res.Err);
                            alert(res.Err);
                        }
                    });
                }
            } catch (err) {
                alert(err);
                console.log(err);
            }
        }
    };

    const onChangeAmtFrm = (val) => {
        setAmountFrom(val.target.value);
        getSwapEstimateAmountTo(val.target.value);
    };

    const onChangeAmtTo = (val) => {
        setAmountTo(val.target.value);
        getSwapEstimateAmountFrm(val.target.value);
    };

    // Helps swap a token to another.
    const onSwap = async () => {
        if (["", "."].includes(amountFrom)) {
            alert("Amount should be a valid number");
            return;
        }
        if (props.contract === null) {
            alert("Connect your wallet");
            return;
        } else {
            try {
                
                if (coin[0] === "KAR") {
                    await props.contract.query
                    .swapToken1(
                        props.activeAccount.address,
                        {value: 0, gasLimit:-1},
                        amountFrom * PRECISION)
                    .then(res => res.output.toHuman())
                    .then(async (res) => {
                        if(!res.Err){
                            await props.contract.tx
                            .swapToken1(
                                {value: 0, gasLimit:-1},
                                amountFrom * PRECISION
                            )
                            .signAndSend(
                                props.activeAccount.address,
                                {signer: props.signer},
                                async (res) => {
                                    if (res.status.isFinalized) {
                                        await props.getHoldings();
                                        alert("Tx successful");
                                      }
                                }
                            );
                            setAmountFrom(0);
                            setAmountTo(0);
                            alert("Tx submitted");
                        } else {
                            console.log(res.Err);
                            alert(res.Err);
                        }
                    });
                } else {
                    await props.contract.query
                    .swapToken2(
                        props.activeAccount.address,
                        {value: 0, gasLimit:-1},
                        amountFrom * PRECISION)
                    .then(res => res.output.toHuman())
                    .then(async (res) => {
                        if(!res.Err){
                            await props.contract.tx
                            .swapToken1(
                                {value: 0, gasLimit:-1},
                                amountFrom * PRECISION
                            )
                            .signAndSend(
                                props.activeAccount.address,
                                {signer: props.signer},
                                async (res) => {
                                    if (res.status.isFinalized) {
                                        await props.getHoldings();
                                        alert("Tx successful");
                                      }
                                }
                            );
                            setAmountFrom(0);
                            setAmountTo(0);
                            alert("Tx submitted");
                        } else {
                            console.log(res.Err);
                            alert(res.Err);
                        }
                    });
                }
            } catch (err) {
                alert(err);
                console.log(err);
            }
        }
    };

    const onChangeTolerance = (val) => {
        if( val !== slippageTolerance) {
            setSlippageTolerance(val);
        }
    }

    return (
        <div className="tabBody">
            <div className="tabHeader">Swap</div>
            <BoxTemplate
                leftHeader={"From"}
                right={<div className="coinWrapper">{coin[0]}</div>}
                value={amountFrom}
                showBalance={true}
                balance={props.holding["amountOfKAR".includes(coin[0]) ? "amountOfKAR" : "amountOfKOTHI"]}
                onChange={(e) => onChangeAmtFrm(e)}
            />
            <div className="alignCenter" onClick={() => rev()}>
                <div className="tabIcon middleIcon" tabIndex={0}><MdSwapVert className="swapIcon"/></div>
            </div>
            <BoxTemplate
                leftHeader={"To"}
                right={<div className="coinWrapper">{coin[1]}</div>}
                value={amountTo}
                showBalance={true}
                balance={props.holding["amountOfKAR".includes(coin[1]) ? "amountOfKAR" : "amountOfKOTHI"]}
                onChange={(e) => onChangeAmtTo(e)}
            />
            <div className="selectTolerance">
                <div className="toleranceHeading">
                    SLIPPAGE TOLERANCE
                </div>
                <div className="toleranceValues">
                    {
                        tolerance.map( val => {
                            return (<div className={"toleranceCard " + (slippageTolerance === val? "selectedTolerance" : "")}  onClick={() => onChangeTolerance(val)}>
                                {val + "%"}
                            </div>)
                        })
                    }
                </div>
            </div>
            <div className="transactionFee">
                    TRANSACTION FEE: {"xyz"}
            </div>
            <div className="bottomDiv">
                <div className="btn" onClick={() => onSwap()}>
                    Swap
                </div>
            </div>
        </div>
    );
}
