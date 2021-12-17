<template>
  <v-app>
    <v-app-bar app  class="indigo" dark>
      <v-spacer></v-spacer>
      <v-toolbar-title><router-link to="/" class="teth">Tethonic</router-link></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-content>
      <v-snackbar
        v-model="snackbar"
        :bottom="true"
        :timeout="5000"
      >
        {{ snackbarText }}
        <v-btn dark text @click="snackbar = false">Close</v-btn>
      </v-snackbar>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import * as dbutils from '@/lib/dbutils';
import * as grab from '@/lib/httpmethods';

export default {
  name: 'App',

  components: {
  },

  data: () => ({
    snackbar: false,
    snackbarText: null,
  }),
  async created() {
    /* await this.addLastBlock();
    setInterval(async () => {
      await this.addLastBlock();
    }, 300000);

    setInterval(async () => {
      await this.addOldBlocks();
    }, 60000); */
  },
  methods: {
    async addLastBlock() {
      const height = await grab.getLastBlockHeight();
      const bExists = await dbutils.dbBlockExists(height);
      if (!bExists) {
        await dbutils.grabAndSetBlock(height);
        this.snackbarText = `Block ${height} added to DB`;
        this.snackbar = true;
      }
    },
    async addOldBlocks() {
      let nOldest = await dbutils.dbGetOldestID();
      if (nOldest > 0) {
        nOldest -= 1;
        const height = nOldest.toString();
        await dbutils.grabAndSetBlock(height);
      }
    },
  },
};
</script>

<style scoped>
.teth {
  text-decoration: none;
  color: white;
}
</style>
