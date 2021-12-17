# [tethonic](https://tethonic.now.sh/)

tethonic is a simple tether explorer app for tether transacions made on bitcoin blockchain.

Show Block Sums button opens a view with a list of recent blocks containing tether transactions with cumulative sums of all tether transactions
for each block with bitcoin prices in dollars at the given time.  

Show Block button opens a view for a specific blockchain block that lists all the tether transactions within that block together with the bitcoin price at the given time. 

The app is implemented in vue.js using vuetify and firestore.  

The app is using APIs from the following sources:  
coincap.io - to fetch the bitcoin price at the given time  
blockchain.info - to fetch the bitcoin blockchain blocks  
smartbit.com.au - to fetch the bitcoin blockchain block hash from the block height  

some of those APIs are very slow which results in occasional poor performace of the app

To use it, click on the link:
https://tethonic.now.sh/
