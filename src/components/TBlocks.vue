<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <p>Number of last blocks:</p>
      </v-col>
      <v-col cols="1">
        <v-text-field></v-text-field>
      </v-col>
      <v-col>
        <v-btn class="fetchbutton">Fetch</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <!--v-simple-table>
        <thead>
          <tr>
            <th class="text-left">Tx Nr.</th>
            <th class="text-left">USD Value</th>
            <th class="text-left">Tx Time</th>
            <th class="text-left">BTC Price</th>
            <th class="text-left">BTC Price At Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tx, i) in blockData.tether_transactions" :key="i">
            <td>{{ tx.ntx }}</td>
            <td>{{ tx.nValue }}</td>
            <td>{{ moment.unix(tx.time).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
            <td>{{ tx.btcPrice }}</td>
            <td>{{ moment.unix(tx.btcTime).format('dddd, MMMM Do, YYYY h:mm:ss A') }}</td>
          </tr>
        </tbody>
      </v-simple-table-->
    </v-row>
  </v-container>
</template>

<script>
// import axios from 'axios';

export default {
  name: 'TBlocks',
  data: () => ({
    blocks: [],
    blockData: {
      n_tx: null,
      height: null,
      tether_transactions: [],
    },
    loader: null,
  }),
  methods: {
  },
};
</script>

<style scoped>
.fetchbutton {
  margin-top: 0.3rem;
}
</style>
