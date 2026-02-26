import os
from flask import Flask, render_template, send_file

app = Flask(__name__)

GEOJSON_PATH = os.path.join(
    os.path.dirname(__file__),
    "..", "data", "fish_predict", "north_sea_fishing_prediction.geojson"
)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/data")
def data():
    return send_file(
        os.path.abspath(GEOJSON_PATH),
        mimetype="application/geo+json"
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
