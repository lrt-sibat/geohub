---
title: Publish your dataset as open data
---

## Publish a dataset

In this section, we are going to learn how to publish an ingested dataset as an open data.

Firstly, please go to [datasets page](https://geohub.data.undp.org/data) and open `My Data` tab. In `My Data` tab, you will be able to manage all your uploaded datasets and ingested datasets at one place. The following figure shows how you can go to publish an ingested dataset. The procedures are:

1. Click `chevron` icon to expand an uploaded item
1. Check the status of ingested item. If status shows `Unpublished`, it is ready to publish!
1. Open menu for an ingested item, then click `Publish` menu.

<figure markdown="span">
  ![publish_1](../assets/data/publish_1.png){:style="width: 600px;"}
  <figcaption>Go to publish page from an ingested dataset</figcaption>
</figure>

After clicking `Publish` menu, you will be redirected to a publish page as shown in the below figure.

<figure markdown="span">
  ![publish_2](../assets/data/publish_2.png){:style="width: 600px;"}
  <figcaption>Overview of publish page</figcaption>
</figure>

In publish page, it consists of four to five tabs depending on dataset type either `raster` or `vector`. You may find tabs as follows:

- `GENERAL` tab: You can input general information for a dataset.
- `COVERAGE` tab: You can select data coverage either global or regional.
- `TOOLS` tab: If it is raster dataset, you maybe can register analytical tools to this dataset.
- `TAGS` tab: You can associate SDGs tags or any other additional tags to this dataset.
- `PREVIEW` tab: This tab provides you a simple preview of this dataset.

## Register metadata

Now, we are going to explain each item which you need to input for publishing. Let's begin.

### Input basic information

Basic information can be inputted under `GENERAL` tab.

The below figure shows an example inputs of general tab information.

<figure markdown="span">
  ![publish_3](../assets/data/publish_3.png){:style="width: 100%;"}
  <figcaption>An example of general tab at publish page</figcaption>
</figure>

In `GENRAL` tab, it consists of the following five elements. All properties must be entered or selected appropriately.

- **Dataset name**:

Please write a concise title for this dataset. This title will be used for searching datasets.

- **Description**:

Please write description of this dataset in detail as much as possible. So, other users will read and understand what this dataset is. This field is also used for searching datasets.

- **License**:

Please select a data license. This is important whether you allow other users to use your data. About license, we will explain in [the next section](#what-license-is-appropriate).

- **Data providers**:

Please select at least a data provider. Providers selected here will be shown as attribution on maps. As default, `United Nations Development Programme` is entered. However, you can delete default value and search or create an organisation name from the dialog. You can select multiple providers as you wish.

- **Data accesibility**:

You can set accessibility for this dataset.

`Public` is selected as default, this means the dataset will be opened to everybody anonymously. Any unsigned users also can access to your data.
`Your organization name`, like `UNDP` depending on which UN agency you are from, you maybe can see your organization name here. If you select organizational accessibilty, your data will only be accessible by signed users within your organization.
`Your first name` is that you or specific users whom you gave permission can access to your dataset.

If you feel like this dataset is not yet ready to publish, you can select organizational or private accessibility. When you want to make it open to everybody, you can change accessibility to `Public` any time.

### What license is appropriate?

Selecting an open data license for your data is critical because the license is an only way for you to show other users whether your data is reused and redistributed freely or in some circumstances.

The following table show the major open data licenses. There are specific terms you need to be aware of:

- **Domain**: What type of material this license can be applied to. This normally can be either `Content` or `Data`.
- **BY**: Attribution (copyright) is required for using this data.
- **SA**: share-alike is required to redistribute this data. Share-alike is that other users have to use the same license of original one when they change and redistribute the data again,

| License                                                     | Domain       | By  | SA  |
| ----------------------------------------------------------- | ------------ | --- | --- |
| Creative Commons Attribution 4.0 (CC-BY-4.0)                | Content,Data | Y   | N   |
| Creative Commons Attribution Share-Alike 4.0 (CC-BY-SA-4.0) | Content,Data | Y   | Y   |
| Open Data Commons Open Database License (ODbL)              | Data         | Y   | Y   |

There are many open data licenses available, please refer to [here](https://opendefinition.org/licenses/) for more information.

!!! note

    You can also select `license no specified` for your data. But this may limit other users to use your data. Basically other users cannot reuse it for any other purposes.
    Furtheremore, some of open data license may not be listed in the select box in editing page. In such case, you can select `Others` from select box, then please specify your license details in `description` property of your dataset.

### Select data coverage

It is important to select what coverage is supported by your data. So other users can find your data easily by using global or a country tag. The folloiwng screenshot shows an example of coverage selection. You can simplely follow questions to select them appropriately.

<figure markdown="span">
  ![publish_4](../assets/data/publish_4.png){:style="width: 100%;"}
  <figcaption>An example of coverage tab at publish page</figcaption>
</figure>

Firstly, you have to select either `Global` or `Regional`. If your data cover for the entire world, please select `Global`.

Secondary, the selection of continents will be asked if you select `Regional`. Please select single/multiple continents for your datasets. If your data supports a country from Africa, please select `Africa`.

Thirdly, you will be asked to select sub regions for selected continents. For instance, if your data is for `Rwanda`, please select `Sub-Saharan Africa`. You can select multiple sub regions as much as you want.

Lastly, this is the most important selection. Please select counties from search button to associate your data to specific country tags. You can type a country name to filter counties on the dialog, and just click a country flag to select/deselect. If a country is selected, yo uwill be able to see selected countries under search button.

<figure markdown="span">
  ![publish_9](../assets/data/publish_9.png){:style="width: 200px;"}
  <figcaption>Select country on countries search dialog</figcaption>
</figure>

### Select tags

As shown in the below figure, two types of tags can be selected additionally for your dataset.

<figure markdown="span">
  ![publish_5](../assets/data/publish_5.png){:style="width: 100%;"}
  <figcaption>An example of tags tab at publish page</figcaption>
</figure>

- SDGs

If your dataset is related to any SDGs, you can select a single / multiple SDGs from the button. You can select goals as much as you want. You can see selected SDG icons under the button.

<figure markdown="span">
  ![publish_10](../assets/data/publish_10.png){:style="width: 300px;"}
  <figcaption>Selection of SDGs</figcaption>
</figure>

!!! note

    Your selected SDGs tags will be used to search datasets by other users. It is important to select related SDG tags for your dataset. So, it will be easier for other people to find your valuable dataset.

- Optional tags

There are several categories available for you to select for your data. These additional tags may also be used for searching by other users. Also, some of tags such as `Unit` will be shown as metadata of your dataset.

<figure markdown="span">
  ![publish_11](../assets/data/publish_11.png){:style="width: 100%;"}
  <figcaption>Selection of Other tags</figcaption>
</figure>

The steps to select other tag is shown at the above figure.

1. Select a category from select box
1. Try to search an existing tag from search window by clicking search button. You can filter by free keyword, then double-click to add it.
1. You can also enter any keyword directly on textbox if you could not find an appropriate tag from existing ones.
1. Lastly, don't forget to click `+ (add)` button to add selected tag on the list.

### Preview

Preview tab can help you check how your data looks like on a map. The style will be selected randomly in this stage, so the visualization might not look the best.

<figure markdown="span">
  ![publish_6](../assets/data/publish_6.png){:style="width: 100%;"}
  <figcaption>An example of preview tab at publish page</figcaption>
</figure>

### Tools (Optional)

For some raster dataset, you maybe can select tools for your dataset. As shown in the below figure, you can see available tools for the dataset.

<figure markdown="span">
  ![publish_12](../assets/data/publish_12.png){:style="width: 100%;"}
  <figcaption>Selection of tools</figcaption>
</figure>

#### Tools for Elevation data

If your data is elevation data, you may associate following tools to your data.

- Hillshade: Create hillshade from DEM dataset.
- Contours: Create contours from DEM dataset.
- Terrarium: Encode DEM into RGB (Mapzen Terrarium).
- TerrainRGB: Encode DEM into RGB (Mapbox Terrain RGB).

!!! note

    `Terrarium` and `TerrainRGB` will convert your data into `RasterDEM` format which allows `maplibre GL JS` to dynamically render hillshade layer.

#### Tools for index

- Normalized Difference Index: Compute normalized difference index from two bands.

#### GeoHub analytical tools

- Rapid Change Assessment Tool: Quick assessment to detect changes by comparing two bands.

### Publish

Once you have entered all necessary information (check green tick icon at tabs), you can click `Publish` button.

You will be asked in the following dialog for next step.

<figure markdown="span">
  ![publish_7](../assets/data/publish_7.png){:style="width: 600px;"}
  <figcaption>Publish completion dialog</figcaption>
</figure>

- Go to dataset: If you want to go to this dataset page, please click this button.
- [Set default appearance](#register-default-appearance-optional): If you wish to continue setting default appearance of your data, please click this button. No worries, you can set default appearance anytime later.

If you click `Go to dataset`, you will be redirected to this newly created dataset page. The below figure is an example.

<figure markdown="span">
  ![publish_8](../assets/data/publish_8.png){:style="width: 100%;"}
  <figcaption>Newly published dataset page</figcaption>
</figure>

## Register default appearance (optional)

When you published a dataset, you can move to default layer style setting page. Or you can also do default apearance settings from `Preview` tab of the dataset page.

<figure markdown="span">
  ![publish_13](../assets/data/publish_13.png){:style="width: 100%;"}
  <figcaption>Deafult layer appearance settings</figcaption>
</figure>

You can save default layer style for each layer type (if vector) or band (if raster). This setting can be useful for other users to add your data with preconfigured appropriate appearance. Otherwise, every user have to do their own layer styling by yourselves.

Basic layer visualization is described in [Visualization](../visualization/index.md) section.

## Next step

In next section, we are going to explore some of existing datasets at GeoHub.