const customers = require('../model/addCard');
const { PUBLISHABLE_KEY, SECRET_KEY } = process.env;
const stripe = require('stripe')(SECRET_KEY);

const createCustomer = async (req, res) => {
  // try {
  //   const customer = await stripe.customers.create({
  //     card_Name: req.body.card_Name,
  //     email: req.body.email,
  //   });

  //   // console.log("hello");
  //   // const newCustomer = new customers({
  //   //   card_Name: customer.card_Name,
  //   //   email: customer.email,
  //   //   customerId: customer.id
  //   // });
  //   res.status(200).send(customer);
  // } catch (error) {
  //   res.status(400).send({ success: false, msg: error.message, message: "error" });
  // }

    try {

        const customer = await stripe.customers.create({
          name:req.body.name,
            email:req.body.email, 
        });
        const customerId = customer.id;
        console.log("=====>>>", customerId);
        const {
          card_Name,
          card_ExpYear,
          card_ExpMonth,
          card_Number,
          card_CVC,
        } = req.body;

        const card_token = await stripe.tokens.create({
          card: {
            name: card_Name,
            number: card_Number,
            exp_year: card_ExpYear,
            exp_month: card_ExpMonth,
            cvc: card_CVC,
          },
        });

        const card = await stripe.customers.createSource(customerId, {
          source: `${card_token.id}`,
        });

        console.log(card_token);
       
        const cardId = card.id
    

          const { plan } = req.body;
          const amount = "";
    const currentDate = new Date();
    let nextDate;
    if (plan === 'monthly') {
      nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
      amount = "3.49"
    } else if (plan === 'yearly') {
      nextDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
      amount = "34.99";
    }

    const createCharge = await stripe.charges.create({
      receipt_email: 'tester@gmail.com',
      amount: parseInt(amount) * 100,
       // amount*100
      currency: 'usd',
      card: cardId,
      customer: customerId,
    });
        res.status(200).send({ createCharge, amount, nextDate });


    } catch (error) {
        res.status(400).send({success:false,_id:null});
    }


};

const addNewCard = async (req, res) => {
  try {
    const {
      customer_id,
      card_Name,
      card_ExpYear,
      card_ExpMonth,
      card_Number,
      card_CVC,
     
    } = req.body;

    const card_token = await stripe.tokens.create({
      card: {
        name: card_Name,
        number: card_Number,
        exp_year: card_ExpYear,
        exp_month: card_ExpMonth,
        cvc: card_CVC,
      },
    });

    const card = await stripe.customers.createSource(customer_id, {
      source: `${card_token.id}`,
    
    });
    // Save the card details to MongoDB
    // const newCard = new customers({
    //   customerId: customer_id,
    //   cardId: card.id,
    //   cardName: card_Name,
    //   cardExpYear: card_ExpYear,
    //   cardExpMonth: card_ExpMonth,
    //   cardNumber: card_Number,
    //   cardCVC: card_CVC,
    // });
    res.status(200).send({ card: card.id, card_token });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message, message: "error" });
  }
};

const createCharges = async (req, res) => {
  try {
    const { plan, amount } = req.body;
    const currentDate = new Date();
    let nextDate;
    if (plan === 'monthly') {
      nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
      amount;
    } else if (plan === 'yearly') {
      nextDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
      amount ;
    }

    const createCharge = await stripe.charges.create({
      receipt_email: 'tester@gmail.com',
      amount: amount * 100, // Multiply by 100 to convert to the smallest currency unit (e.g., cents)
      currency: 'eur',
      card: req.body.card_id,
      customer: req.body.customer_id,
    });

    res.status(200).send({ createCharge, amount, nextDate });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

module.exports = {
  createCustomer,
  addNewCard,
  createCharges
};
