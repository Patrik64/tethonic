<template>
  <v-container>
    <v-snackbar
        v-model="snackbar"
        :bottom="true"
        :timeout="5000"
      >
        {{ snackbarText }}
      <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <!--v-row>
      <v-col cols="2">
        <v-text-field v-model="heightStart" label="Start Block Height" type="number"></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-text-field v-model="heightEnd" label="End Block Height" type="number"></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="fetchData" class="my-3">
          <span class="caption">Show All Block Sums</span>
        </v-btn>
      </v-col>
    </v-row-->
    <v-row v-if="blockSums.length > 0">
      <v-col cols="12">
        <div class="chart-wrapper">
          <chart :options="chartOptionsBar"></chart>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <v-switch v-model="showBefore" label="Show BTC Price Before"></v-switch>
      </v-col>
      <v-col cols="3">
        <v-switch v-model="showAfter1m" label="Show BTC Price After 1 Minute"></v-switch>
      </v-col>
      <v-col cols="3">
        <v-switch v-model="showAfter2m" label="Show BTC Price After 2 Minutes"></v-switch>
      </v-col>
      <v-col cols="3">
        <v-switch v-model="showAfter3m" label="Show BTC Price After 3 Minutes"></v-switch>
      </v-col>
      <v-col cols="3">
        <v-switch v-model="showAfter4m" label="Show BTC Price After 4 Minutes"></v-switch>
      </v-col>
      <v-col cols="3">
        <v-switch v-model="showAfter5m" label="Show BTC Price After 5 Minutes"></v-switch>
      </v-col>
      <v-col cols="3">
        <v-switch v-model="barLabels" label="Bar Labels"></v-switch>
      </v-col>
      <!--v-col cols="3">
        <v-row v-if="blockSums.length > 0">
          <v-col class="shrink" style="min-width: 220px;">
            <div>Block Sum Color</div>
            <v-text-field v-model="barColor" hide-details class="ma-0 pa-0" solo>
              <template v-slot:append>
                <v-menu v-model="colorBarMenu"
                  top nudge-bottom="105"
                  nudge-left="16"
                  :close-on-content-click="false">
                  <template v-slot:activator="{ on }">
                    <div :style="swatchBarColorStyle" v-on="on" />
                  </template>
                  <v-card>
                    <v-card-text class="pa-0">
                      <v-color-picker v-model="barColor" flat />
                    </v-card-text>
                  </v-card>
                </v-menu>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row v-if="blockSums.length > 0">
          <v-col class="shrink" style="min-width: 220px;">
            <div>BTC Price Before Color</div>
            <v-text-field v-model="lineColor" hide-details class="ma-0 pa-0" solo>
              <template v-slot:append>
                <v-menu v-model="colorLineMenu"
                  top nudge-bottom="105"
                  nudge-left="16"
                  :close-on-content-click="false">
                  <template v-slot:activator="{ on }">
                    <div :style="swatchLineColorStyle" v-on="on" />
                  </template>
                  <v-card>
                    <v-card-text class="pa-0">
                      <v-color-picker v-model="lineColor" flat />
                    </v-card-text>
                  </v-card>
                </v-menu>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row v-if="blockSums.length > 0">
          <v-col class="shrink" style="min-width: 220px;">
            <div>BTC Price After Color</div>
            <v-text-field v-model="line2Color" hide-details class="ma-0 pa-0" solo>
              <template v-slot:append>
                <v-menu v-model="colorLine2Menu"
                  top nudge-bottom="105"
                  nudge-left="16"
                  :close-on-content-click="false">
                  <template v-slot:activator="{ on }">
                    <div :style="swatchLine2ColorStyle" v-on="on" />
                  </template>
                  <v-card>
                    <v-card-text class="pa-0">
                      <v-color-picker v-model="line2Color" flat />
                    </v-card-text>
                  </v-card>
                </v-menu>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-col-->
    </v-row>
    <v-row v-show="blockSums.length > 0">
      <v-col cols="12">
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Block Height</th>
              <th class="text-left">USD Value</th>
              <th class="text-left">Block Time</th>
              <th class="text-left">BTC Price Before</th>
              <th class="text-left">BTC Time Before</th>
              <th class="text-left">BTC Price After</th>
              <th class="text-left">BTC Time After</th>
              <th class="text-left">Diff</th>
             </tr>
          </thead>
          <tbody>
            <tr v-for="(bs, i) in blockSums"
              :key="i"
              v-bind:style=" { color: colorForValue(bs.sum).color,
                              backgroundColor: colorForValue(bs.sum).backgroundColor }">
              <td>{{ bs.height }}</td>
              <td>{{ formatUSD(bs.sum) }}</td>
              <td>{{ moment.unix(bs.time).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
              <td>{{ formatUSD(bs.btcPriceBefore) }}</td>
              <td>{{ moment.unix(bs.btcTimeBefore).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
              <td>{{ formatUSD(bs.btcPricesAfter[4]) }}</td>
              <td>
                {{ moment.unix(bs.btcTimesAfter[4]).format('dddd, MMMM Do, YYYY h:mm:ss A') }}
              </td>
              <td v-if="bs.btcPricesAfter[4] === bs.btcPriceBefore">
                <v-icon>drag_handle</v-icon>
              </td>
              <td v-else-if="bs.btcPricesAfter[4] > bs.btcPriceBefore">
                <v-icon color="green">arrow_upward</v-icon>
              </td>
              <td v-else><v-icon color="red">arrow_downward</v-icon></td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as dbutils from '@/lib/dbutils';
// import * as grab from '@/lib/httpmethods';

export default {
  name: 'BlockSum',

  data: () => ({
    loader: null,
    heightStart: null,
    heightEnd: null,
    snackbar: null,
    snackbarText: null,
    filterLimit: 10000,
    blocks: null,
    blockSums: [],
    showLineData: [],
    barLabels: false,
    showBefore: true,
    showAfter1m: false,
    showAfter2m: false,
    showAfter3m: false,
    showAfter4m: false,
    showAfter5m: true,
    barColor: '#6495ED',
    lineColor: '#006400',
    line2Color: '#FF0000',
    colorBarMenu: false,
    colorLineMenu: false,
    colorLine2Menu: false,
    chartOptionsBar: {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      legend: {
        selectMode: true,
        data: [
          'Block Sum',
          'BTC Price Before',
          'BTC Price After 1 minute',
          'BTC Price After 2 minutes',
          'BTC Price After 3 minutes',
          'BTC Price After 4 minutes',
          'BTC Price After 5 minutes',
        ],
        selected: {
          'BTC Price After 1 minute': true,
          'BTC Price After 2 minutes': false,
          'BTC Price After 3 minutes': false,
          'BTC Price After 4 minutes': false,
        },
      },
      xAxis: {
        data: [],
      },
      yAxis: [
        {
          type: 'value',
          name: 'Block Sum USD',
          axisLabel: {
            formatter: '{value} USD',
          },
        },
        {
          type: 'value',
          name: 'BTC Price USD',
          axisLabel: {
            formatter: '{value} USD',
          },
        },
      ],
      series: [
        {
          name: 'Tether Value',
          type: 'bar',
          label: {
            show: false,
            position: 'inside',
            formatter(params) {
              const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              });
              return formatter.format(params.data);
            },
          },
          data: [],
        },
        {
          name: 'BTC Price Before',
          type: 'line',
          yAxisIndex: 1,
          data: [],
        },
        {
          name: 'BTC Price After 1 minute',
          type: 'line',
          yAxisIndex: 1,
          data: [],
        },
        {
          name: 'BTC Price After 2 minutes',
          type: 'line',
          yAxisIndex: 1,
          data: [],
        },
        {
          name: 'BTC Price After 3 minutes',
          type: 'line',
          yAxisIndex: 1,
          data: [],
        },
        {
          name: 'BTC Price After 4 minutes',
          type: 'line',
          yAxisIndex: 1,
          data: [],
        },
        {
          name: 'BTC Price After 5 minutes',
          type: 'line',
          yAxisIndex: 1,
          data: [],
        },
      ],
      title: {
        text: 'Block Sums',
        x: 'center',
        textStyle: {
          fontSize: 24,
        },
      },
      color: ['#6495ED', '#006400', '#FFA500', '#6A5ACD', '#B0E0E6', '#9ACD32', '#DC143C'],
    },
  }),
  async created() {
    this.loader = this.$loading.show({
      loader: 'bars',
      opacity: 0.85,
      transition: 'none',
      height: 128,
      width: 128,
      'is-full-page': true,
      'background-color': '#FF0000',
    });

    this.blockSums = [];
    this.blocks = await dbutils.dbGetAllBlocks();

    this.blocks.forEach((b) => {
      if (b) {
        const blockSum = {};
        blockSum.sum = b.sum;
        blockSum.time = b.time;
        blockSum.height = b.height;
        blockSum.btcPriceBefore = b.btcPriceBefore;
        blockSum.btcTimeBefore = b.btcTimeBefore;
        blockSum.btcPricesAfter = [...b.btcPricesAfter];
        blockSum.btcTimesAfter = [...b.btcTimesAfter];
        this.blockSums.push(blockSum);
      }
    });

    // sort by time
    this.blockSums.sort((a, b) => {
      if (a.height < b.height) {
        return -1;
      }
      if (a.height > b.height) {
        return 1;
      }
      return 0;
    });

    this.chartOptionsBar.xAxis.data = [];
    this.chartOptionsBar.series[0].data = [];
    this.chartOptionsBar.series[1].data = [];
    this.showLineData = [];

    this.blockSums.forEach((bs) => {
      this.chartOptionsBar.xAxis.data.push(bs.height);
      this.chartOptionsBar.series[0].data.push(bs.sum);
      this.chartOptionsBar.yAxis[0].interval = -1;
      const nBPB = parseFloat(bs.btcPriceBefore, 10);
      this.chartOptionsBar.series[1].data.push(nBPB);

      const nBPA1 = parseFloat(bs.btcPricesAfter[0], 10);
      this.chartOptionsBar.series[2].data.push(nBPA1);
      const nBPA2 = parseFloat(bs.btcPricesAfter[1], 10);
      this.chartOptionsBar.series[3].data.push(nBPA2);
      const nBPA3 = parseFloat(bs.btcPricesAfter[2], 10);
      this.chartOptionsBar.series[4].data.push(nBPA3);
      const nBPA4 = parseFloat(bs.btcPricesAfter[3], 10);
      this.chartOptionsBar.series[5].data.push(nBPA4);
      const nBPA5 = parseFloat(bs.btcPricesAfter[4], 10);
      this.chartOptionsBar.series[6].data.push(nBPA5);
    });

    this.showLineData.push(this.chartOptionsBar.series[1].data);
    this.showLineData.push(this.chartOptionsBar.series[2].data);
    this.showLineData.push(this.chartOptionsBar.series[3].data);
    this.showLineData.push(this.chartOptionsBar.series[4].data);
    this.showLineData.push(this.chartOptionsBar.series[5].data);
    this.showLineData.push(this.chartOptionsBar.series[6].data);

    const minV1 = Math.round(Math.min(...this.chartOptionsBar.series[1].data));
    const minV2 = Math.round(Math.min(...this.chartOptionsBar.series[2].data));
    const minV3 = Math.round(Math.min(...this.chartOptionsBar.series[3].data));
    const minV4 = Math.round(Math.min(...this.chartOptionsBar.series[4].data));
    const minV5 = Math.round(Math.min(...this.chartOptionsBar.series[5].data));
    const minV6 = Math.round(Math.min(...this.chartOptionsBar.series[6].data));

    const maxV1 = Math.round(Math.max(...this.chartOptionsBar.series[1].data));
    const maxV2 = Math.round(Math.max(...this.chartOptionsBar.series[2].data));
    const maxV3 = Math.round(Math.max(...this.chartOptionsBar.series[3].data));
    const maxV4 = Math.round(Math.max(...this.chartOptionsBar.series[4].data));
    const maxV5 = Math.round(Math.max(...this.chartOptionsBar.series[5].data));
    const maxV6 = Math.round(Math.max(...this.chartOptionsBar.series[6].data));
    const minV = Math.min(minV1, minV2, minV3, minV4, minV5, minV6);
    const maxV = Math.max(maxV1, maxV2, maxV3, maxV4, maxV5, maxV6);

    let intervalV = Math.round((maxV - minV) / 25);
    if (intervalV < 1) intervalV = 1;
    this.chartOptionsBar.yAxis[1].min = minV - intervalV;
    this.chartOptionsBar.yAxis[1].max = maxV + intervalV;
    this.chartOptionsBar.yAxis[1].interval = intervalV;

    if (!this.showBefore) {
      this.chartOptionsBar.series[1].data = [];
    }
    if (!this.showAfter1m) {
      this.chartOptionsBar.series[2].data = [];
    }
    if (!this.showAfter2m) {
      this.chartOptionsBar.series[3].data = [];
    }
    if (!this.showAfter3m) {
      this.chartOptionsBar.series[4].data = [];
    }
    if (!this.showAfter4m) {
      this.chartOptionsBar.series[5].data = [];
    }
    if (!this.showAfter5m) {
      this.chartOptionsBar.series[6].data = [];
    }


    this.loader.hide();
  },
  watch: {
    barLabels(val) {
      this.chartOptionsBar.series[0].label.show = val;
    },
    showBefore(val) {
      if (val) {
        this.chartOptionsBar.series[1].data = [...this.showLineData[0]];
      } else {
        this.chartOptionsBar.series[1].data = [];
      }
    },
    showAfter1m(val) {
      if (val) {
        this.chartOptionsBar.series[2].data = [...this.showLineData[1]];
      } else {
        this.chartOptionsBar.series[2].data = [];
      }
    },
    showAfter2m(val) {
      if (val) {
        this.chartOptionsBar.series[3].data = [...this.showLineData[2]];
      } else {
        this.chartOptionsBar.series[3].data = [];
      }
    },
    showAfter3m(val) {
      if (val) {
        this.chartOptionsBar.series[4].data = [...this.showLineData[3]];
      } else {
        this.chartOptionsBar.series[4].data = [];
      }
    },
    showAfter4m(val) {
      if (val) {
        this.chartOptionsBar.series[5].data = [...this.showLineData[4]];
      } else {
        this.chartOptionsBar.series[5].data = [];
      }
    },
    showAfter5m(val) {
      if (val) {
        this.chartOptionsBar.series[6].data = [...this.showLineData[5]];
      } else {
        this.chartOptionsBar.series[6].data = [];
      }
    },
    barColor(val) {
      this.chartOptionsBar.color[0] = val;
      this.chartOptionsBar.series[0].label.show = !this.chartOptionsBar.series[0].label.show;
      this.chartOptionsBar.series[0].label.show = !this.chartOptionsBar.series[0].label.show;
    },
    lineColor(val) {
      this.chartOptionsBar.color[1] = val;
      this.chartOptionsBar.series[0].label.show = !this.chartOptionsBar.series[0].label.show;
      this.chartOptionsBar.series[0].label.show = !this.chartOptionsBar.series[0].label.show;
    },
    line2Color(val) {
      this.chartOptionsBar.color[2] = val;
      this.chartOptionsBar.series[0].label.show = !this.chartOptionsBar.series[0].label.show;
      this.chartOptionsBar.series[0].label.show = !this.chartOptionsBar.series[0].label.show;
    },
  },
  computed: {
    swatchBarColorStyle() {
      const color = this.barColor;
      const menu = this.colorBarMenu;
      return {
        backgroundColor: color,
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderRadius: menu ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out',
      };
    },
    swatchLineColorStyle() {
      const color = this.lineColor;
      const menu = this.colorLineMenu;
      return {
        backgroundColor: color,
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderRadius: menu ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out',
      };
    },
    swatchLine2ColorStyle() {
      const color = this.line2Color;
      const menu = this.colorLine2Menu;
      return {
        backgroundColor: color,
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderRadius: menu ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out',
      };
    },
  },
  methods: {
    async fetchData() {
      this.blockSums = [];

      this.loader = this.$loading.show({
        loader: 'bars',
        opacity: 0.85,
        transition: 'none',
        height: 128,
        width: 128,
        'is-full-page': true,
        'background-color': '#FF0000',
      });

      let nHS = parseInt(this.heightStart, 10);
      let nHE = parseInt(this.heightEnd, 10);

      if (nHS > nHE) {
        [nHS, nHE] = [nHE, nHS];
      }

      const nDiff = nHE - nHS;
      if (nDiff > 200) {
        this.snackbarText = 'Range is too large - keep it up to 200 blocks';
        this.snackbar = true;
        this.loader.hide();
        return;
      }

      // test all blocks

      this.blocks = await dbutils.dbGetAllBlocks();

      /* const arrBlockPromises = [];
      for (let i = nHS; i <= nHE; i += 1) {
        const strHeight = i.toString();
        const block = dbutils.dbGetBlock(strHeight);
        arrBlockPromises.push(block);
      }

      this.blocks = await Promise.all(arrBlockPromises); */

      this.blocks.forEach((b) => {
        if (b) {
          const blockSum = {};
          blockSum.sum = b.sum;
          blockSum.time = b.time;
          blockSum.height = b.height;
          blockSum.btcPrice = b.btcPrice;
          blockSum.btcTime = b.btcTime;
          this.blockSums.push(blockSum);
        }
      });

      // sort by time
      this.blockSums.sort((a, b) => {
        if (a.height < b.height) {
          return -1;
        }
        if (a.height > b.height) {
          return 1;
        }
        return 0;
      });

      this.chartOptionsBar.xAxis.data = [];
      this.chartOptionsBar.series[0].data = [];
      this.chartOptionsBar.series[1].data = [];

      this.blockSums.forEach((bs) => {
        this.chartOptionsBar.xAxis.data.push(bs.height);
        this.chartOptionsBar.series[0].data.push(bs.sum);
        this.chartOptionsBar.yAxis[0].interval = -1;
        const nBP = parseFloat(bs.btcPrice, 10);
        this.chartOptionsBar.series[1].data.push(nBP);
      });

      const minV = Math.round(Math.min(...this.chartOptionsBar.series[1].data));
      const maxV = Math.round(Math.max(...this.chartOptionsBar.series[1].data));
      let intervalV = Math.round((maxV - minV) / 25);
      if (intervalV < 1) intervalV = 1;
      this.chartOptionsBar.yAxis[1].min = minV - intervalV;
      this.chartOptionsBar.yAxis[1].max = maxV + intervalV;
      this.chartOptionsBar.yAxis[1].interval = intervalV;

      this.loader.hide();
    },
    colorForValue(value) {
      const ret = { color: 'black', backgroundColor: 'white' };
      const nV = parseInt(value, 10);
      if (nV > 1000000) {
        ret.color = 'red';
        ret.backgroundColor = '#F8F8FF';
        return ret;
      }
      if (nV > 100000) {
        ret.color = 'blue';
        ret.backgroundColor = '#F0F8FF';
        return ret;
      }
      if (nV > 10000) {
        ret.color = 'green';
        ret.backgroundColor = '#F5FFFA';
        return ret;
      }
      return ret;
    },
    formatUSD(num) {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      return formatter.format(num);
    },
  },
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 700px;
}
.echarts {
  width: 100%;
  height: 100%;
}
</style>
