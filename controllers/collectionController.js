const createClient = require("../utils/supabase");

const collectionController = {};

collectionController.addUserCollection = async (req, res, next) => {
  const supabase = createClient({ req, res });
  const { collection } = req.body;
  console.log(collection);
  // const x = supabase.from(user_subscriptions).insert();
};

collectionController.deleteUserCollection = (req, res, next) => {
  // Logic for deleting a user
};

module.exports = collectionController;
