import nmslib
import pandas as pd
from fastai.basic_train import load_learner
from fastai.vision import open_image
from sentence_transformers import SentenceTransformer

"""Set all paths"""
IMG_PATH = '../Flickr/Images'
MODEL_PATH = '../models'
IDX_PATH = '../models/query_idx'

"""Load required files"""
path_map = pd.read_csv('../models/path_map.csv').to_dict()['path']
learn = load_learner(MODEL_PATH, 'flickr8k_inf.pkl')

query_idx = nmslib.init(space='angulardist')
query_idx.loadIndex(IDX_PATH, load_data=True)

sentence_embedder = SentenceTransformer('roberta-large-nli-stsb-mean-tokens')

"""Define all functions"""
def get_knn(index, vec, k=10):  return index.knnQuery(vec, k=k)

def text2embedding(text):   return sentence_embedder.encode(text)

def get_sim(emb, n_imgs):
    idxs, dists = get_knn(query_idx, emb, n_imgs)
    paths = [IMG_PATH+'/'+path_map[idx] for idx in idxs]
    return paths, dists

def search_sim(query, is_caption, n_imgs):
    if is_caption:
        emb = text2embedding(query)
        img_paths, dists = get_sim(emb, n_imgs)
    else:
        img = open_image(query)
        _, _, pred = learn.predict(img)
        img_paths, dists = get_sim(pred, n_imgs)
    return img_paths, dists

if __name__=="__main__":
    print(search_sim('snow.jpg', False, 10))
