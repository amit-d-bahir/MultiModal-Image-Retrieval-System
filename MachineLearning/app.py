from flask import Flask,request,jsonify
from flask_cors import CORS
import nmslib
import pathlib
import os
import pandas as pd
from fastai.basic_train import load_learner
from fastai.vision import open_image
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
CORS(app)

"""Set all paths"""
IMG_PATH = os.path.join(os.path.dirname(__file__), 'Images')
MODEL_PATH = './'
IDX_PATH = './query_idx'

"""Load required files"""
path_map = pd.read_csv('./path_map.csv').to_dict()['path']
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

def search_sim(query, is_caption, n_imgs = 10):
    if is_caption:
        emb = text2embedding(query)
        img_paths, dists = get_sim(emb, n_imgs)
    else:
        img = open_image(query)
        _, _, pred = learn.predict(img)
        img_paths, dists = get_sim(pred, n_imgs)
    return img_paths, dists

@app.route("/ml", methods=["POST"])  # Creating a decorator
def search():
  if request.method == 'POST':
    print("img path", IMG_PATH)
    request_data = request.get_json()
    print("request_data:", request_data)
    print("image_no", request_data['image_no'])
    if 'image' in request_data:
      img_paths, dists = search_sim(request_data['image'], False, request_data['image_no'])
    else:
      img_paths, dists = search_sim(request_data['text'], True, request_data['image_no'])

    dists = dists.tolist()
    data = {
      'images': img_paths,
      'dists': dists
    }
    # print("immg_paths", img_paths)
    # print("img_path dtype", type(img_paths))
    # print("dists:", dists)
    # print("dists type:", type(dists))
    print("DATA: ", data)
    return jsonify(data)

  return jsonify({"message" : "Didn't perform search for similar images"})


if __name__=="__main__":
  app.run(debug=True,host='0.0.0.0',port = 8081)