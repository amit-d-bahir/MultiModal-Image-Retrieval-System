import React from "react";
import ImageUploader from "react-images-upload";
import { Button, message } from "antd";
import { CloudUploadOutlined, SearchOutlined } from "@ant-design/icons";
import { Image, Spin, Skeleton } from "antd";
import { Tabs } from "antd";
import { Input } from "antd";
import { Card } from "antd";
import { Select } from "antd";
const { Option } = Select;

const BACKEND_URL = "http://localhost:8080";
const { TabPane } = Tabs;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      picture: [],
      upload_allowed: false,
      uploading: false,
      text: "",
      file: null,
      no_of_images: 5,
      search_allowed: false,
      dists: [],
      processed_file_data: [],
    };
    this.onDrop = this.onDrop.bind(this);
    this.searchWithText = this.searchWithText.bind(this);
    this.searchWithImage = this.searchWithImage.bind(this);
    this.handleNoChange = this.handleNoChange.bind(this);
  }

  onDrop(picture) {
    if (!this.state.uploading) {
      if (picture.length) {
        this.setState({
          picture: picture[0],
          upload_allowed: true,
          processed_file_data: [],
        });
      } else {
        this.setState({
          picture: [],
          upload_allowed: false,
          processed_file_data: [],
        });
      }
    }
  }
  searchWithImage() {
    var { picture, text } = this.state;
    if (picture) {
      this.setState({ uploading: true });
      var formdata = new FormData();
      this.setState({ loading: true });
      formdata.append("file", picture, picture.name);
      formdata.append("text", text);
      formdata.append("image_no", this.state.no_of_images);
      var requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
      };
      fetch(BACKEND_URL, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          if (result.status) {
            this.setState({
              uploading: false,
              dists: result.dists,
              processed_file_data: result.processed_file_data,
            });
          } else {
            message.warning(result.message);
            this.setState({ uploading: false });
          }
        })
        .catch((error) => {
          console.log("error", error);
          message.warning(error.message);
          this.setState({ uploading: false });
        });
    } else {
      message.warning("Please Select a image");
    }
  }
  searchWithText() {
    var { text } = this.state;
    if (text) {
      this.setState({ uploading: true });
      var formdata = new FormData();
      this.setState({ loading: true });
      formdata.append("text", text);
      formdata.append("image_no", this.state.no_of_images);
      var requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
      };
      fetch(BACKEND_URL, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          if (result.status) {
            console.log(result.dists);
            this.setState({
              uploading: false,
              processed_file_data: result.processed_file_data,
              dists: result.dists,
            });
          } else {
            message.warning(result.message);
            this.setState({ uploading: false });
          }
        })
        .catch((error) => {
          console.log("error", error);
          message.warning(error.message);
          this.setState({ uploading: false });
        });
    } else {
      message.warning("Please Enter Some Text");
    }
  }
  handleNoChange(value) {
    this.setState({ no_of_images: value });
  }
  render() {
    return (
      <div className="text-center">
        <Spin spinning={this.state.uploading} tip="Please Wait" size="large">
          <Tabs
            defaultActiveKey="1"
            centered
            className="mx-auto shadow p-3 mb-5 bg-white rounded rounded mt-5"
            style={{ width: "400px", maxWidth: "100%" }}
          >
            <TabPane
              tab="Search With Image"
              key="1"
              style={{ minHeight: "200px" }}
            >
              <Card bordered={false}>
                <ImageUploader
                  withIcon={false}
                  disabled={true}
                  withLabel={false}
                  withPreview={true}
                  singleImage={true}
                  buttonText="Select image"
                  onChange={this.onDrop}
                  imgExtension={[".jpg", ".gif", ".png", ".gif", ".jpeg"]}
                  maxFileSize={5242880}
                />
                <label>No. of image:&nbsp;</label>
                <Select
                  defaultValue="5"
                  style={{ width: 120 }}
                  onChange={this.handleNoChange}
                  value={this.state.no_of_images}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      this.searchWithImage();
                    }
                  }}
                >
                  <Option value="5">5</Option>
                  <Option value="10">10</Option>
                  <Option value="15">15</Option>
                  <Option value="25">25</Option>
                  <Option value="30">30</Option>
                  <Option value="35">35</Option>
                </Select>
                <br />
                <br />
                <Button
                  type="primary"
                  disabled={!this.state.upload_allowed}
                  size="large"
                  shape="round"
                  loading={this.state.uploading}
                  onClick={this.searchWithImage}
                  icon={<CloudUploadOutlined />}
                >
                  Upload
                </Button>
              </Card>
            </TabPane>
            <TabPane
              tab="Search With Text"
              key="2"
              style={{ minHeight: "200px" }}
            >
              <Card bordered={false}>
                <Input
                  placeholder="Enter Your Text"
                  allowClear
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      this.searchWithText();
                    }
                  }}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value) {
                      var allowed = true;
                    } else {
                      this.setState({
                        processed_file_data: [],
                      });
                      allowed = false;
                    }
                    this.setState({ text: value, search_allowed: allowed });
                  }}
                />
                <br />
                <br />

                <label>No. of image:&nbsp;</label>
                <Select
                  defaultValue="5"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      this.searchWithText();
                    }
                  }}
                  style={{ width: 120 }}
                  onChange={this.handleNoChange}
                  value={this.state.no_of_images}
                >
                  <Option value="5">5</Option>
                  <Option value="10">10</Option>
                  <Option value="15">15</Option>
                  <Option value="25">25</Option>
                  <Option value="30">30</Option>
                  <Option value="35">35</Option>
                </Select>
                <br />
                <br />
                <Button
                  type="primary"
                  disabled={!this.state.search_allowed}
                  size="large"
                  shape="round"
                  loading={this.state.uploading}
                  onClick={this.searchWithText}
                  icon={<SearchOutlined />}
                >
                  Search
                </Button>
              </Card>
            </TabPane>
          </Tabs>
        </Spin>
        <div className="col-lg-6 mx-auto row">
          {this.state.uploading ? (
            <>
              <Skeleton />

              <Skeleton />
              <Skeleton />
            </>
          ) : (
            <>
              {this.state.processed_file_data.map((image, key) => {
                return (
                  <div className="col-lg-4 mx-auto mt-5">
                    <Image src={BACKEND_URL + "/" + image} style={{height:'200px', width:'200px'}}/>
                    <br />
                    <center>{this.state.dists[key].toFixed(3)}</center>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default App;
