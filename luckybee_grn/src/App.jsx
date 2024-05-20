import { FrappeApp } from "frappe-js-sdk";
import { useEffect, useState, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Slide } from "react-slideshow-image";
import "./App.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Addimage from "./Components/Addimage";

var ind = 0;
const App = () => {
  const [items, setItems] = useState([]);
  const [currItem, setCurrentItem] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  // function getToken() {
  //   return "0ea4f0ee1c773b5:b73a8c0c1acd3ee";
  // }

  const siteurl = "https://yash.tranqwality.com";
  const frappe = new FrappeApp(siteurl);
  const auth = frappe.auth();
  const db = frappe.db();
  const files = frappe.file();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentItem({ ...currItem, [name]: value });
  };
  const file = frappe.file();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [frontButtonVisible, setFrontButtonVisible] = useState(true);
  const [backButtonVisible, setbackButtonVisible] = useState(true);
  const [rightButtonVisible, setRightButtonVisible] = useState(true);
  const [leftButtonVisible, setLeftButtonVisible] = useState(true);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  const [selectedView, setSelectedView] = useState(null);
  const [allfinalimgs, setallfinalimgs] = useState([]);
  const [finalimg, setfinalimg] = useState([]);
  const [itemname, setItemname] = useState([]);
  const [count, setCount] = useState(0);
  const [itemlength, setitemlength] = useState();
  const [is_asin, setIssAsin] = useState(0);
  const [images, setImages] = useState([]);
  const [clickvalue, setclickvalue] = useState([]);

  const openView = (id) => {
    setclickvalue(id);
    setSelectedView(id);
    setIsCameraOpen(true);
  };
  useEffect(() => {
    const frontViewImage = images.find(
      (image) => image.view === "Front view" && image.image !== null
    );
    if (frontViewImage) {
      setImage1(frontViewImage.image);
    }
  }, [images]);

  useEffect(() => {
    const backViewImage = images.find(
      (image) => image.view === "Back view" && image.image !== null
    );
    if (backViewImage) {
      setImage2(backViewImage.image);
    }
  }, [images]);

  useEffect(() => {
    const rightViewImage = images.find(
      (image) => image.view === "Right view" && image.image !== null
    );
    if (rightViewImage) {
      setImage3(rightViewImage.image);
    }
  }, [images]);

  useEffect(() => {
    const leftViewImage = images.find(
      (image) => image.view === "Left view" && image.image !== null
    );
    if (leftViewImage) {
      setImage4(leftViewImage.image);
    }
  }, [images]);
  useEffect(() => {
    setallfinalimgs([image1, image2, image3, image4]);
  }, [image1, image2, image3, image4]);

  const handleTakePhoto = (dataUri) => {
    const imageObject = { imageangle: dataUri, value: clickvalue };
    if (selectedView === "Front view") {
      setFrontButtonVisible(false);
      setImage1(imageObject);
    } else if (selectedView === "Back view") {
      setImage2(imageObject);
      setbackButtonVisible(false);
    } else if (selectedView === "Right view") {
      setImage3(imageObject);
      setRightButtonVisible(false);
    } else if (selectedView === "Left view") {
      setImage4(imageObject);
      setLeftButtonVisible(false);
    }
    setIsCameraOpen(false);
  };

  async function fetchData() {
    db.getDoc("Purchase Invoice", inputValue)
      .then((doc) => {
        if (doc?.items.length > 0) {
          setitemlength(doc.items.length);
          setImagePreview("");
          setItems(doc?.items);
          setCurrentItem(doc?.items[ind]);
          setDueDate(doc?.due_date);
        } else {
          handleResetValues();
        }
      })
      .catch((error) => {
        setItems([]);
        console.error(error);
      });
  }
  const submitForm = async (e) => {
    e.preventDefault();
    try {
      // Log in user
      await auth.loginWithUsernamePassword({
        username: "Administrator",
        password: "admin",
      });
      console.log("Logged in");

      // Fetch Purchase Invoice
      const doc = await db.getDoc("Purchase Invoice", inputValue, {
        secure: true,
      });
      setImagePreview("");
      console.log(doc);
      setIssAsin(doc?.custom_is_asin);
      setitemlength(doc?.items.length);
      setItems(doc?.items);
      setCurrentItem((prevItem) => doc?.items[ind]);
      setDueDate(doc?.due_date);
    } catch (error) {
      setItems([]);
      console.error(error);
    }
  };

  useEffect(() => {
    if (currItem && count === 0) {
      const fetchData = async () => {
        try {
          const items = [];
          const itemDoc = await db.getDoc("Item", currItem.item_code);
          items.push(itemDoc.item_code);
          setItemname(items);
          setCount(1);
        } catch (error) {
          setItems([]);
          console.error(error);
        }
      };
      fetchData();
    }
  }, [currItem, count]);
  useEffect(() => {
    if (itemname && count === 1) {
      Promise.all(
        itemname.map((item) => db.getDoc("Item", item, { secure: true }))
      )
        .then((docs) => {
          const allImages = docs.map((doc) => doc.custom_item_images_);
          const mergedImages = [].concat(...allImages);
          setImages(mergedImages);
          setCount(2);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [itemname, count]);

  if (images && images.length > 0 && count === 2) {
    const updatedFinalImg = images.map((image) => ({
      url: image.image,
    }));
    setfinalimg(updatedFinalImg);
    setCount(3);
  }

  const spanStyle = {
    padding: "20px",
    background: "#efefef",
    color: "#000000",
  };

  const divStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundSize: "cover",
    height: "400px",
    width: "400px",
  };

  const Slideshow = () => {
    return (
      <div className="slide-container">
        <Slide>
          {finalimg.map((image, index) => (
            <div key={index}>
              <div className={image.url}>
                <img
                  src={image.url}
                  alt=""
                  style={{ width: "100%", height: "260px" }}
                />
              </div>
            </div>
          ))}
        </Slide>
      </div>
    );
  };

  const changeimage = () => {
    // console.log(images);
    document.querySelector(".showimg").style.display = "none";
    document.querySelector(".addimages").style.display = "block";
  };

  const previous = () => {
    if (ind === 0) {
      alert("No previous element");
    } else {
      setCurrentItem(items[ind - 1]);
      // saveData();
      ind = ind - 1;
      setCount(0);
      document.querySelector(".showimg").style.display = "block";
      document.querySelector(".addimages").style.display = "none";
      setFrontButtonVisible(true);
      setbackButtonVisible(true);
      setRightButtonVisible(true);
      setLeftButtonVisible(true);
      setImage1(null);
      setImage2(null);
      setImage3(null);
      setImage4(null);
      fetchData();
    }
  };

  const next = () => {
    if (ind === items.length - 1) {
      alert("No next element");
    } else {
      setCurrentItem(items[ind + 1]);
      // saveData();
      ind = ind + 1;
      setCount(0);
      fetchData();
      document.querySelector(".showimg").style.display = "block";
      document.querySelector(".addimages").style.display = "none";
      setFrontButtonVisible(true);
      setbackButtonVisible(true);
      setRightButtonVisible(true);
      setLeftButtonVisible(true);
      setImage1(null);
      setImage2(null);
      setImage3(null);
      setImage4(null);
    }
  };

  const [fileimage, setfileimage] = useState([]);
  const fileimageRef = useRef([]);

  useEffect(() => {
    fileimageRef.current = fileimage;
  }, [fileimage]);

  const updatereceipt = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const fetchImageBlob = async (imageUrl) => {
          const response = await fetch(imageUrl);
          return await response.blob();
        };
        const nonEmptyImages = allfinalimgs.filter((img) => img !== null);
        const imageAngles = nonEmptyImages.map((img) => img.imageangle);
        const blobs = await Promise.all(imageAngles.map(fetchImageBlob));

        const images = blobs.map((blob) => {
          const uniqueId =
            Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          const filename = `image_${uniqueId}.png`;
          return new File([blob], filename, { type: blob.type });
        });

        const fileArgs = {
          isPrivate: true,
          folder: "Home",
          file_url: "",
          doctype: "User",
          docname: "Administrator",
          fieldname: "image",
        };

        const promises = images.map((image, index) => {
          return file
            .uploadFile(image, fileArgs, (completedBytes, totalBytes) =>
              console.log(Math.round((completedBytes / totalBytes) * 100))
            )
            .then((result) => {
              const updatedFileimage = [
                ...fileimageRef.current,
                {
                  image: result.data.message.file_url,
                  view: nonEmptyImages[index].value,
                },
              ];
              fileimageRef.current = updatedFileimage;
              setfileimage(updatedFileimage);
              alert("done");
            })
            .catch((error) => {
              console.error("Error uploading image:", error);
              reject(error);
            });
        });

        await Promise.all(promises);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
  const saveData = async () => {
    try {
      await updatereceipt();
      let prev = [];
      for (let i = 0; i < images.length; i++) {
        prev.push({
          image: images[i].image,
          view: images[i].value,
        });
      }
      Array.prototype.push.apply(prev, fileimageRef.current);
      console.log("prev", prev);
      if (!currItem.custom_is_asin) {
        const currentItemCode = currItem.item_code;
        await db.updateDoc("Item", currentItemCode, {
          brand: currItem.brand,
          custom_mrp: currItem.custom_mrp,
          ean: currItem.custom_ean,
          custom_sub_category: currItem.custom_subcategory,
          description: currItem.description,
          custom_item_images_: prev,
        });
        setfileimage([]);
        PurchaseUpdateDocInvoice();
      } else {
        PurchaseUpdateDocInvoice();
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  async function PurchaseUpdateDocInvoice() {
    const updatedItems = items.map((item) => {
      if (item.name === currItem.name) {
        // Return a new object with updated properties from currItem
        return {
          ...item,
          custom_asin: currItem.custom_asin,
          custom_box_number: currItem.custom_box_number,
          // item_name: currItem.item_name,
          // description: currItem.description,
          // brand: currItem.brand,
          // custom_subcategory: currItem.custom_subcategory,
          // custom_ean: currItem.custom_ean,
          // custom_mrp: currItem.custom_mrp,
          qty: parseFloat(currItem.qty),
          rejected_qty:
            parseFloat(currItem.received_qty) - parseFloat(currItem.qty),
          // received_qty: currItem.received_qty
          // Add more properties as needed
        };
      }
      return item; // Return the original item if it doesn't match the criteria
    });

    db.updateDoc("Purchase Invoice", inputValue, {
      items: updatedItems,
      due_date: dueDate,
    })
      .then((doc) => {
        // setInputValue('');
        // setCurrentItem({
        //     custom_asin: '',
        //     custom_box_number: '',
        //     image: '',
        //     item_name: '',
        //     description: '',
        //     brand: '',
        //     custom_subcategory: '',
        //     custom_ean: '',
        //     custom_mrp: '',
        //     qty: '',
        //     received_qty: '',

        // });
        // setDueDate('');
        // setItems([]);
        // ind = 0
        setCurrentItem(items[ind]);
        alert("Updated Successfully");
        fetchData();
        console.log("its a doc", doc);
      })
      .catch((error) => {
        try {
          console.log(error);

          const errorObject = JSON.parse(error?._server_messages);
          const error_message = errorObject[0];
          console.log(JSON.parse(error_message?.message));
          alert(JSON.parse(error_message.message));
        } catch (error) {
          alert("Check The Details Again");
        }
      });
  }

  const printBarcode = () => {
    const barcodeWindow = window.open("");
    barcodeWindow.document.write('<svg id="barcode"></svg>');

    JsBarcode(
      barcodeWindow.document.getElementById("barcode"),
      currItem?.item_code,
      {
        height: 50,
        text: currItem?.rate,
        displayValue: true,
      }
    );

    barcodeWindow.print();
    barcodeWindow.close();
  };

  const [modalShow, setModalShow] = useState(false);
  const [qcModal, setQcModal] = useState(false);
  useEffect(() => {
    auth
      .loginWithUsernamePassword({
        username: "Administrator",
        password: "admin",
      })
      .then((response) => console.log("Logged in"))
      .catch((error) => console.error(error));

    getBrandList();
    getInvoiceList();
  }, []);

  const [brandList, setBrandList] = useState([]);

  async function getBrandList() {
    db.getDocList("Brand", {
      fields: ["name", "creation"],
      limit: 700,
      /** Sort results by field and order  */
      orderBy: {
        field: "creation",
        order: "desc",
      },
    })
      .then((docs) => {
        // console.log(docs)
        setBrandList(docs);
      })
      .catch((error) => console.error(error));
  }

  async function addNewBrand(b) {
    // console.log(b)
    setSelectedBrand(b);
    db.createDoc("Brand", {
      brand: b,
    })
      .then((doc) => {
        // console.log(doc)
        getBrandList();
        setCurrentItem({ ...currItem, brand: b });
        setModalShow(false);
      })
      .catch((error) => console.error(error));
  }

  const [invoiceList, setInvoiceList] = useState([]);
  async function getInvoiceList() {
    db.getDocList("Purchase Invoice", {
      /** Fields to be fetched */
      fields: ["name", "creation"],
      /** Filters to be applied - SQL AND operation */
      filters: [["docstatus", "=", "0"]],

      limit: 50,
      /** Sort results by field and order  */
      orderBy: {
        field: "creation",
        order: "desc",
      },
    })
      .then((docs) => {
        setInvoiceList(docs);
      })
      .catch((error) => console.error(error));
  }

  // qc conditions based

  const [qcItem, setQcItem] = useState({
    purchase_invoice: "",
    item_code: "",
    damaged: 1,
    main_damaged: 0,
    hole_main: 1,
    torn_main: 0,
    marks_main: 0,
    scratched_main: 0,
    part_damaged: 0,
    hole_part: 0,
    torn_part: 0,
    marks_part: 0,
    scratched_part: 0,
    short: 0,
    main_short: 0,
    part_short: "",
    received: 0,
    out_of: 0,
    importance: "",
    not_working: 0,
    offer_discount: "",
    buy_part: 0,
    repair: 0,
    scrap: 0,
    qc_pass: "",
  });

  const updateQC = (e) => {
    e.preventDefault();
    db.createDoc("Quality Check", {
      ...qcItem,
      purchase_invoice: inputValue,
      item_code: currItem.item_code,
    })
      .then((doc) => {
        console.log(doc);
        setQcModal(false);
        fetchData();
        setQcItem({
          purchase_invoice: "",
          item_code: "",
          damaged: 1,
          main_damaged: 0,
          hole_main: 1,
          torn_main: 0,
          marks_main: 0,
          scratched_main: 0,
          part_damaged: 0,
          hole_part: 0,
          torn_part: 0,
          marks_part: 0,
          scratched_part: 0,
          short: 0,
          main_short: 0,
          part_short: "",
          received: 0,
          out_of: 0,
          importance: "",
          not_working: 0,
          offer_discount: "",
          buy_part: 0,
          repair: 0,
          scrap: 0,
          qc_pass: "",
        });
      })
      .catch((error) => console.error(error));
  };

  const handleQcUpdate = (event) => {
    const { name, checked, type, value } = event.target;

    if (type == "checkbox") {
      setQcItem({ ...qcItem, [name]: checked });
    } else {
      setQcItem({ ...qcItem, [name]: value });
    }
  };
  const [selectedConditions, setSelectedConditions] = useState([]);
  const handleSelectChange = (e) => {
    const selectedBrand = e.target.value;
    setCurrentItem({ ...currItem, brand: selectedBrand });
  };

  const [rotationAngle, setRotationAngle] = useState(0);
  const handleRotation = () => {
    handleResetValues();
    setRotationAngle(350);
  };

  function handleResetValues() {
    setInputValue("");
    setCurrentItem({
      custom_asin: "",
      custom_box_number: "",
      image: "",
      item_name: "",
      description: "",
      brand: "",
      custom_subcategory: "",
      custom_ean: "",
      custom_mrp: "",
      qty: "",
      received_qty: "",
    });
    setDueDate("");
    setItems([]);
    ind = 0;
  }

  const [selectedBrand, setSelectedBrand] = useState("");

  const [brandValue, setBrandValue] = useState("");

  return (
    <>
      <form onSubmit={submitForm}>
        <div className="search-container container-1">
          <div className="search-btn-container">
            <div className="left-btn" onClick={submitForm}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </div>
            <input
              className="form-control"
              list="datalistOptions"
              id="exampleDataList"
              placeholder="Search search..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
            />
            <div className="left-btn" onClick={handleRotation}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-arrow-clockwise"
                viewBox="0 0 16 16"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transition: "all ease 1s",
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
              </svg>
            </div>
          </div>
          <datalist
            id="datalistOptions"
            onChange={() => {
              submitForm(e);
            }}
          >
            {invoiceList.length > 0 &&
              invoiceList.map((invoice, index) => {
                return <option value={invoice?.name}>{invoice?.name}</option>;
              })}
          </datalist>
        </div>
      </form>
      <form>
        <div className="search-container">
          <h5
            style={{
              fontSize: "1rem",
              textAlign: "center",
              fontWeight: 600,
              color: "grey",
            }}
          >
            {" "}
            {ind + 1} of {items.length}
          </h5>

          {is_asin == 1 && (
            <div id="boxNumberField">
              <label htmlFor="asinReason">Box Number:</label>
              <input
                type="text"
                id="asinReason"
                name="custom_box_number"
                value={currItem?.custom_box_number}
                onChange={handleInputChange}
              />
            </div>
          )}
          <br />
          {is_asin == 1 && (
            <>
              <label htmlFor="itemName">ASIN Number:</label>
              <input
                type="text"
                id="custom_asin"
                value={currItem?.custom_asin || ""}
                name="custom_asin"
                placeholder="ASIN Number"
                onChange={handleInputChange}
              />
              <br />
              <br />
            </>
          )}

          <div className="showimg" style={{ display: "block" }}>
            <Slideshow />
          </div>
          <Addimage
            images={images}
            image1={image1}
            openView={openView}
            image2={image2}
            image3={image3}
            image4={image4}
            handleTakePhoto={handleTakePhoto}
            changeimage={changeimage}
            frontButtonVisible={frontButtonVisible}
            backButtonVisible={backButtonVisible}
            rightButtonVisible={rightButtonVisible}
            leftButtonVisible={leftButtonVisible}
            isCameraOpen={isCameraOpen}
          />
          <label>Item Code :</label>
          <input
            type="text"
            id="item_name"
            placeholder="ItemName"
            value={currItem?.item_code}
            disabled
          />
          <label>ItemName :</label>
          <input
            type="text"
            id="item_name"
            name="item_name"
            placeholder="ItemName"
            value={currItem?.item_name}
            onChange={handleInputChange}
          />

          <label>Description :</label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Description"
            value={currItem?.description}
            onChange={handleInputChange}
          />
          <Modal
            show={modalShow}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter">
                Create a New Brand
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={() => {
                  addNewBrand(selectedBrand);
                }}
              >
                Add
              </Button>
              <Button onClick={() => setModalShow(false)}>Close</Button>
            </Modal.Footer>
          </Modal>

          <label>Brand :</label>
          <input
            className="form-control"
            list="brandOptions"
            id="brandInput"
            placeholder="Search and Select brand..."
            value={currItem?.brand || ""}
            onChange={(e) => {
              if (e.target.value == "Create a New Brand") {
                setModalShow(e.target.value);
                setBrandValue("");
              } else {
                handleSelectChange(e);
                setBrandValue(e.target.value);
              }
            }}
          />

          <datalist
            id="brandOptions"
            defaultValue={currItem?.brand}
            onChange={handleSelectChange}
          >
            <option defaultValue="New_value@#!@#$#@!@#$">
              Create a New Brand
            </option>
            {brandList.map((brand, index) => (
              <option
                key={index}
                defaultValue={brand?.name?.toLowerCase()}
                selected={
                  currItem?.brand?.toLowerCase() === brand?.value?.toLowerCase()
                    ? true
                    : false
                }
              >
                {brand.name}
              </option>
            ))}
          </datalist>
          <br />
          <label>Sub-Category</label>
          <input
            type="text"
            id="subcategory"
            name="custom_subcategory"
            value={currItem?.custom_subcategory}
            onChange={handleInputChange}
          />
          <div className="container">
            <div className="field">
              <label>EAN</label>
              <input
                type="number"
                id="ean"
                name="custom_ean"
                value={currItem?.custom_ean}
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label>MRP:</label>
              <input
                type="number"
                id="rate"
                name="custom_mrp"
                value={currItem?.custom_mrp}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="container">
            <div className="field">
              <label htmlFor="field2">Received Qty :</label>
              <input
                type="number"
                id="received_qty"
                name="received_qty"
                value={currItem?.received_qty}
                disabled
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="field1">Accepted Qty:</label>
              <input
                type="number"
                id="qty"
                name="qty"
                defaultValue={currItem?.qty}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              className="left-btn"
              onClick={() => {
                setQcModal(true);
              }}
              style={{ width: "40px" }}
            >
              <button
                style={{ padding: "5px", marginTop: "10px" }}
                type="button"
              >
                QC
              </button>
            </div>
            <label htmlFor="qc"> QC Pass: {currItem?.custom_qc_pass}</label>
          </div>

          <Modal
            show={qcModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter">QC</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="container row ">
                <form onSubmit={updateQC}>
                  <div className=" m-1 col-12">
                    <label htmlFor="item_name" className="form-label-1">
                      Purchase Invoice:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="item_name"
                      name="item_name"
                      value={inputValue}
                      disabled
                    />
                  </div>
                  <div className="m-1 col-12">
                    <label htmlFor="description" className="form-label-1">
                      Item Code
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="description"
                      name="description"
                      // placeholder=""
                      value={currItem?.item_code}
                      disabled
                    />
                  </div>
                  <div className="m-1 col-12">
                    <label htmlFor="description" className="form-label-1">
                      Product Condition
                    </label>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="productCondition"
                        name="damaged"
                        defaultChecked={currItem?.damaged}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="productCondition"
                      >
                        Damaged
                      </label>
                    </div>
                  </div>
                  <div
                    className="mt-2 form-check col-6"
                    style={{ marginLeft: "20px" }}
                  >
                    <div>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="main_product"
                        defaultChecked={qcItem.main_product}
                        onChange={handleQcUpdate}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="main_product"
                      >
                        Main Product
                      </label>
                    </div>
                    {qcItem.main_product && (
                      <>
                        <div
                          className="mt-2 form-check col-3"
                          style={{ marginLeft: "0px" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="hole_main"
                            defaultChecked={qcItem.hole_main}
                            onChange={handleQcUpdate}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="hole_main"
                          >
                            Hole
                          </label>
                        </div>

                        <div
                          className="mt-2 form-check col-3"
                          style={{ marginLeft: "0px" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="marks_main"
                            checked={qcItem.marks_main}
                            onChange={handleQcUpdate}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="marks_main"
                          >
                            Marks{" "}
                          </label>
                        </div>
                        <div
                          className="mt-2 form-check col-3"
                          style={{ marginLeft: "0px" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="torn_main"
                            checked={qcItem.torn_main}
                            onChange={handleQcUpdate}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="torn_main"
                          >
                            Torn{" "}
                          </label>
                        </div>
                        <div
                          className="mt-2 form-check col-3"
                          style={{ marginLeft: "0px" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="scratched_main"
                            checked={qcItem.scratched_main}
                            onChange={handleQcUpdate}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="scratched_main"
                          >
                            Scratch
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  {/* part strat here*/}
                  <div
                    className="mt-2 form-check col-3"
                    style={{ marginLeft: "20px" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="part_damaged"
                      defaultChecked={qcItem.part_damaged}
                      onChange={handleQcUpdate}
                    />
                    <label className="form-check-label" htmlFor="part_damaged">
                      Part
                    </label>

                    {qcItem.part_damaged == 1 && (
                      <>
                        <div
                          className="mt-2 form-check col-3"
                          style={{ marginLeft: "0px" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="hole_part"
                            defaultChecked={qcItem.hole_part}
                            onChange={handleQcUpdate}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="hole_part"
                          >
                            Hole
                          </label>
                        </div>

                        <div
                          className="mt-2 form-check col-3"
                          style={{ marginLeft: "0px" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="marks_part"
                            checked={qcItem.marks_part}
                            onChange={handleQcUpdate}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="marks_part"
                          >
                            Marks{" "}
                          </label>
                        </div>
                        <div
                          className="mt-2 form-check col-3"
                          style={{ marginLeft: "0px" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="torn_part"
                            checked={qcItem.torn_part}
                            onChange={handleQcUpdate}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="torn_part"
                          >
                            Torn{" "}
                          </label>
                        </div>

                        <div
                          className="mt-2 form-check col-3"
                          style={{ marginLeft: "0px" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="scratched_part"
                            checked={qcItem.scratched_part}
                            onChange={handleQcUpdate}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="scratched_part"
                          >
                            Scratch
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    className="mt-2 form-check col-10"
                    style={{ marginLeft: "20px" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="short"
                      checked={qcItem.short}
                      onChange={handleQcUpdate}
                    />
                    <label className="form-check-label" htmlFor="short">
                      Short
                    </label>
                  </div>
                  <div
                    className="mt-2 form-check col-5"
                    style={{ marginLeft: "20px" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="main_short"
                      checked={qcItem.main_short}
                      onChange={handleQcUpdate}
                    />
                    <label className="form-check-label" htmlFor="main_short">
                      Main
                    </label>
                  </div>
                  <div className="mt-2 form-check col-12">
                    <label
                      className="form-check-label"
                      htmlFor="part"
                      style={{ marginBottom: "10px" }}
                    >
                      Part
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="part_short"
                      value={qcItem.part_short}
                      onChange={handleQcUpdate}
                    />
                  </div>
                  <div className="mt-2 form-check col-12">
                    <label
                      className="form-check-label"
                      htmlFor="received"
                      style={{ marginBottom: "10px" }}
                    >
                      Received
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="received"
                      value={qcItem.received}
                      onChange={handleQcUpdate}
                    />
                  </div>
                  <div className="mt-2 form-check col-12 mt-2">
                    <label
                      className="form-check-label"
                      htmlFor="out_of"
                      style={{ marginBottom: "10px" }}
                    >
                      Out Of
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="out_of"
                      value={qcItem.out_of}
                      onChange={handleQcUpdate}
                    />
                  </div>
                  <div className="mt-2 form-check col-12">
                    <label
                      className="form-check-label"
                      htmlFor="importance"
                      style={{ marginBottom: "10px" }}
                    >
                      Importance :
                    </label>
                    <select
                      className="form-select"
                      defaultValue={qcItem.importance}
                      onChange={handleQcUpdate}
                    >
                      <option value="">Select an option</option>
                      <option value="Low">Low</option>

                      <option value="High">High</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>
                  <div
                    className="mt-2 form-check col-12 p-3"
                    style={{ marginLeft: "20px" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="not_working"
                      checked={qcItem.not_working}
                      onChange={handleQcUpdate}
                    />
                    <label className="form-check-label" htmlFor="not_working">
                      Not Working
                    </label>
                  </div>

                  <div>
                    <label
                      className="form-check-label"
                      htmlFor="offer_discount"
                      style={{ marginBottom: "10px" }}
                    >
                      Offer Discount :
                    </label>
                    <select
                      className="form-select"
                      defaultValue={qcItem.offer_discount}
                      onChange={handleQcUpdate}
                    >
                      <option value="">Select an option</option>
                      <option value="25">25</option>

                      <option value="50">50</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>

                  <div
                    className="mt-2 form-check col-10"
                    style={{ marginLeft: "20px" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="buy_part"
                      checked={qcItem.buy_part}
                      onChange={handleQcUpdate}
                    />
                    <label className="form-check-label" htmlFor="buy_part">
                      Buy Part
                    </label>
                  </div>
                  <div
                    className="mt-2 form-check col-10"
                    style={{ marginLeft: "20px" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="repair"
                      checked={qcItem.repair}
                      onChange={handleQcUpdate}
                    />
                    <label className="form-check-label" htmlFor="repair">
                      Repair
                    </label>
                  </div>
                  <div
                    className="mt-2 form-check col-10"
                    style={{ marginLeft: "20px" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="scrap"
                      checked={qcItem.scrap}
                      onChange={handleQcUpdate}
                    />
                    <label className="form-check-label" htmlFor="scrap">
                      Scrap
                    </label>
                  </div>
                  <div className="mt-2 form-check col-12">
                    <label
                      className="form-check-label"
                      htmlFor="qc_pass"
                      style={{ marginBottom: "10px" }}
                    >
                      QC Pass :
                    </label>
                    <select
                      className="form-select"
                      defaultValue={qcItem.qc_pass}
                      name="qc_pass"
                      onChange={handleQcUpdate}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>

                      <option value="No">No</option>
                    </select>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      marginBlock: "30px",
                    }}
                  >
                    <Button type="submit">Submit</Button>
                    <Button onClick={() => setQcModal(false)}>Close</Button>
                  </div>
                </form>
              </div>
            </Modal.Body>
          </Modal>
          <div id="additionalField" style={{ display: "none" }}>
            <label htmlFor="additionalInfo">Reason:</label>
            <input type="text" id="additionalInfo" name="additionalInfo" />
            <br />
          </div>
          <br />
        </div>
        <div className="search-container">
          <div className="save-container">
            <div className="left-btn" onClick={previous}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-arrow-left-square"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm11.5 5.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"
                />
              </svg>
            </div>
            <button type="button" className="save-btn" onClick={saveData}>
              Save Data
            </button>
            <div className="right-btn" onClick={next}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-arrow-right-square"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"
                />
              </svg>
            </div>
          </div>
          <button type="button" onClick={printBarcode}>
            Print barcode
          </button>
        </div>
      </form>
    </>
  );
};

export default App;
