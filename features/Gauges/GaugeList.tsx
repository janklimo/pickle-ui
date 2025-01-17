import { FC, useEffect, useState } from "react";
import { formatEther } from "ethers/lib/utils";
import styled from "styled-components";
import { Spacer, Grid, Checkbox, Button, Input } from "@geist-ui/react";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import { PercentageInput } from "../../components/PercentageInput";
import { GaugeCollapsible } from "./GaugeCollapsible";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { Connection } from "../../containers/Connection";
import { TransactionStatus, useGaugeProxy } from "../../hooks/useGaugeProxy";
import { VoteCollapsible } from "./VoteCollapsible";
import { GaugeChartCollapsible } from "./GaugeChartCollapsible";
import { PICKLE_JARS } from "../../containers/Jars/jars";
import { backgroundColor, pickleGreen } from "../../util/constants";

const Container = styled.div`
  padding-top: 1.5rem;
`;

interface Weights {
  [key: string]: number;
}

const GreenSwitch = withStyles({
  switchBase: {
    color: backgroundColor,
    "&$checked": {
      color: pickleGreen,
    },
    "&$checked + $track": {
      backgroundColor: pickleGreen,
    },
  },
  checked: {},
  track: {},
})(Switch);

export const GaugeList: FC = () => {
  const { signer } = Connection.useContainer();
  const { gaugeData } = UserGauges.useContainer();
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [voteWeights, setVoteWeights] = useState<Weights>({});
  const { status: voteTxStatus, vote } = useGaugeProxy();
  const [showUserGauges, setShowUserGauges] = useState<boolean>(false);

  let totalGaugeWeight = 0;
  for (let i = 0; i < gaugeData?.length; i++) {
    totalGaugeWeight += voteWeights[gaugeData[i].address] || 0;
  }

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (!gaugeData) {
    return <h2>Loading...</h2>;
  }

  const isDisabledFarm = (depositToken: string) =>
    depositToken === PICKLE_JARS.pUNIBACDAI ||
    depositToken === PICKLE_JARS.pUNIBASDAI || 
    depositToken === PICKLE_JARS.pUNIETHLUSD;

  const activeGauges = gaugeData.filter(
    (x) => !isDisabledFarm(x.depositToken.address),
  );
  const inactiveGauges = gaugeData.filter((x) => false || isDisabledFarm(x.depositToken.address));
  const userGauges = gaugeData.filter((gauge) =>
    parseFloat(formatEther(gauge.staked)),
  );

  const moveInArray = (arr: UserGaugeData[], from: number, to: number) => {
    var item = arr.splice(from, 1);

    if (!item.length) return;
    arr.splice(to, 0, item[0]);
  };
  
  const indexofAlcx = activeGauges.findIndex(
    (x) =>
      x.depositToken.address.toLowerCase() ===
      PICKLE_JARS.pSUSHIETHALCX.toLowerCase(),
  );
  moveInArray(activeGauges, indexofAlcx, 1);
  
  const indexofYvboost = activeGauges.findIndex(
    (x) =>
      x.depositToken.address.toLowerCase() ===
      PICKLE_JARS.pyvBOOSTETH.toLowerCase(),
  );
  moveInArray(activeGauges, indexofYvboost, 1);

  const indexofLUSD = activeGauges.findIndex(
    (x) =>
      x.depositToken.address.toLowerCase() ===
      PICKLE_JARS.pyLUSDCRV.toLowerCase(),
  );
  moveInArray(activeGauges, indexofLUSD, 1);
  const indexofUSDC = activeGauges.findIndex(
    (x) =>
      x.depositToken.address.toLowerCase() === PICKLE_JARS.pyUSDC.toLowerCase(),
  );
  moveInArray(activeGauges, indexofUSDC, 1);

  const renderGauge = (gauge: UserGaugeData) => (
    <Grid xs={24} key={gauge.address}>
      <div css={{ display: "flex", alignItems: "center" }}>
        <GaugeCollapsible gaugeData={gauge} />
      </div>
    </Grid>
  );

  return (
    <>
      <Grid.Container>
        <Grid md={12}>
          <p>
            Farms allow you to earn PICKLEs by staking tokens.
            <br />
            Hover over the displayed APY to see where the returns are coming
            from.
          </p>
        </Grid>
        <Grid md={12} style={{ textAlign: "right" }}>
          <Checkbox
            checked={showInactive}
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            Show Inactive Farms
          </Checkbox>{" "}
          <GreenSwitch
            style={{ top: "-2px" }}
            checked={showUserGauges}
            onChange={() => setShowUserGauges(!showUserGauges)}
          />
          Show Your Farms
        </Grid>
      </Grid.Container>
      <h2>Current Weights</h2>
      <GaugeChartCollapsible gauges={activeGauges} />
      <h2>Vote</h2>
      <VoteCollapsible
        gauges={activeGauges.filter(
          (x) => x.depositToken.address != PICKLE_JARS.pSUSHIETHYVECRV,
        )}
      />
      <div
        css={{
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2>Active Farms</h2>
      </div>
      <Grid.Container gap={1}>{(showUserGauges ? userGauges : activeGauges).map(renderGauge)}</Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive Farms</h2>}
        {showInactive && inactiveGauges.map(renderGauge)}
      </Grid.Container>
    </>
  );
};
