
import mongoose from 'mongoose';


const RevokeTokenSchema = new mongoose.Schema({

  tokenId: {
    type: String,
    required: true,
  },
  expireAt: {
    type: String,
    required: true,
  }
}, {
  timestamps: true 
});



const revokeTokenModel = mongoose.models.RevokeToken || mongoose.model("RevokeToken", RevokeTokenSchema);

export default revokeTokenModel