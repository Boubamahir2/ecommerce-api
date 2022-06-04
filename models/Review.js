const mongoose = require('mongoose');
//when creating a review we need to atach the user and product to the review
const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true }
);

//this functionality means user can only create one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });//here we are creating compound index for the product and user


//lets calculate the average rating for the product and the number of reviews
// this static method is called on the model and not on the instance of the model
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  // this is the pipeline is comming from the mongoDB method aggregate
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  
// this methods is coming from the mongoDB method 
  // const agg = [
  //   {
  //     $match: {
  //       product: new ObjectId("629914dfe6e7a4aaba880033"),
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: null,
  //       avearageRating: {
  //         $avg: "$rating",
  //       },
  //       numOfReviews: {
  //         $sum: 1,
  //       },
  //     },
  //   },
  // ];


  try {
    await this.model('Product').findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};


ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
