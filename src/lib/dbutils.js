import { db } from '../firebase.tethonic';
import * as grab from './httpmethods';

export async function dbSetBlock(block) {
  const docID = block.height.toString();
  db.collection('blocks').doc(docID).set({
    ...block,
  }).catch((error) => { console.error('Error writing document to Firestore: ', error); });
}

export async function dbGetBlock(height) {
  const docRef = db.collection('blocks').doc(height);
  const ret = await docRef.get();
  return ret.data();
}

export async function dbGetAllBlocks() {
  const snapshot = await db.collection('blocks').get();
  return snapshot.docs.map(doc => doc.data());
}

export async function dbBlockExists(height) {
  const docRef = db.collection('blocks').doc(height);
  const ret = await docRef.get();
  return ret.exists;
}

export async function dbGetLastID() {
  const snapshot = await db.collection('blocks').get();
  const ids = snapshot.docs.map(doc => doc.id);
  const nids = ids.map(id => parseInt(id, 10));
  nids.sort((a, b) => b - a);
  if (!nids[0]) return -1;
  return nids[0];
}

export async function dbGetOldestID() {
  const snapshot = await db.collection('blocks').get();
  const ids = snapshot.docs.map(doc => doc.id);
  const nids = ids.map(id => parseInt(id, 10));
  nids.sort((a, b) => a - b);
  if (!nids[0]) return -1;
  let ret = nids[nids.length - 1];
  for (let i = nids.length - 1; i >= 0; i -= 1) {
    const curr = nids[i];
    if (i > 0) {
      const prev = nids[i - 1];
      if ((curr - prev) > 1) return curr;
      ret = prev;
    }
  }
  return ret;
}

export async function grabAndSetBlock(height) {
  try {
    const block = await grab.getBlockDataFromHeight(height);
    if (block) {
      await dbSetBlock(block);
    }
  } catch (err) {
    console.log('grabAndSetBlock for height -> ', height, 'error -> ', err);
  }
}
