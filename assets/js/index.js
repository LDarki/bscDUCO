const initialize = () => {
  const $ = document.querySelector.bind(document);
  const mmaskButton = $("#connectButton");
  const web3 = new Web3(window.ethereum);

  let ducoContract = "";
  let userAccounts = [];

  const loginForm = $("#login");
  const nameInput = $("#username");
  const passInput = $("#password");
  const loginSubmit = $("#loginSubmit");
  const dashboard = $("#wallet");
  const userBalanceBsc = $("#userBalanceBsc");
  const userBalance = $("#userBalance");
  const wrapBtn = $("#wrapBtn");
  const unwrapBtn = $("#unwrapBtn");
  const error = $("#errorModal");
  const success = $("#successModal");
  const transactions = $("#transactions");

  const home = $("#home");
  const wrap = $("#wrap");
  const unwrap = $("#unwrap");
  const addBtn = $("#addButton");

  const wrapHandler = () => {
    if ($("#wrapContainer").classList.contains("hidden")) $("#wrapContainer").classList.remove("hidden");
    if (!$("#unwrapContainer").classList.contains("hidden")) $("#unwrapContainer").classList.add("hidden");
    if (!$("#homeContainer").classList.contains("hidden")) $("#homeContainer").classList.add("hidden");
  };

  const unwrapHandler = () => {
    if (!$("#wrapContainer").classList.contains("hidden")) $("#wrapContainer").classList.add("hidden");
    if ($("#unwrapContainer").classList.contains("hidden")) $("#unwrapContainer").classList.remove("hidden");
    if (!$("#homeContainer").classList.contains("hidden")) $("#homeContainer").classList.add("hidden");
  };

  const homeHandler = () => {
    if (!$("#wrapContainer").classList.contains("hidden")) $("#wrapContainer").classList.add("hidden");
    if (!$("#unwrapContainer").classList.contains("hidden")) $("#unwrapContainer").classList.add("hidden");
    if ($("#homeContainer").classList.contains("hidden")) $("#homeContainer").classList.remove("hidden");
  };


  const wrapping = () => {
    const amount = $("#wrapAmount").value;
    const address = $("#wrapAddress").value;
    const data = $("#wrapData").value;

    wrapBtn.disabled = true;

    if (data.length > 0 && address.length > 0 && amount > 0) {
      console.log(data);
      fetch(`https://server.duinocoin.com/transaction?username=${nameInput.value}&password=${passInput.value}&recipient=${data}&amount=${amount}&memo=${address}`).then(data => data.json()).then((data) => {
        if (data.success == true) {
          serverMessage = data["result"].split(",");
          if (serverMessage[0] == "OK") {
            success.classList.remove("hidden");
            success.querySelector(".title").innerHTML = "Success!";
            success.querySelector(".data").innerHTML = `<span><b>` +
              serverMessage[1] +
              `</b></span><br> Transaction hash: <a target="_blank" href='https://explorer.duinocoin.com?search=` +
              serverMessage[2] + "'>" +
              serverMessage[2] +
              `</a></p>`

            wrapBtn.disabled = false;
          }
        } else {
          error.classList.remove("hidden");
          error.querySelector(".title").innerHTML = "Error";
          error.querySelector(".data").innerHTML = `<b>An error has occurred while sending funds: </b>` + data.message + `</b><br></p>`;
          wrapBtn.disabled = false;
        }
      });
    }
    else {
      error.classList.remove("hidden");
      error.querySelector(".title").innerHTML = "Error";
      error.querySelector(".data").innerHTML = "Please fill all fields";
      wrapBtn.disabled = false;
    }
  };

  wrapBtn.addEventListener("click", wrapping);

  const unwrapping = async () => {
    const amount = $("#unwrapAmount").value;
    const address = $("#unwrapAddress").value;

    let amountFixed = web3.utils.toWei(amount);

    unwrapBtn.disabled = true;

    if (address.length > 0 && amount > 0) 
    {
      if (Number(await ducoContract.methods.balanceOf(address).call()) >= Number(amountFixed)) 
      {
        ducoContract.methods.initiateWithdraw(address, amountFixed).send({'from':address}).then((receipt) => {
            success.classList.remove("hidden");
            success.querySelector(".title").innerHTML = "Success!";
            success.querySelector(".data").innerHTML = `Transaction hash: ${receipt.transactionHash}`;
        });
        unwrapBtn.disabled = false;
      }
      else {
        error.classList.remove("hidden");
        error.querySelector(".title").innerHTML = "Error";
        error.querySelector(".data").innerHTML = "Insufficient balance";
        unwrapBtn.disabled = false;
      }
    }
    else {
      error.classList.remove("hidden");
      error.querySelector(".title").innerHTML = "Error";
      error.querySelector(".data").innerHTML = "Please fill all fields";
      unwrapBtn.disabled = false;
    }
  };


  unwrapBtn.addEventListener("click", unwrapping);

  const addHandler = async () => {
    await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: "0xCF572cA0AB84d8Ce1652b175e930292E2320785b",
          symbol: "bscDUCO",
          decimals: 18,
          image: "https://bsc.duinocoin.com/ducowhite.png",
        },
      },
    });
  };

  wrap.addEventListener("click", wrapHandler);
  unwrap.addEventListener("click", unwrapHandler);
  home.addEventListener("click", homeHandler);
  addBtn.addEventListener("click", addHandler);

  let duco_price = 0.0065;
  let balance = 0;

  const round_to = (precision, value) => {
    /* https://explorer.duinocoin.com */
    power_of_ten = 10 ** precision;
    return Math.round(value * power_of_ten) / power_of_ten;
  };


  const updateUserData = () => {

    fetch("https://server.duinocoin.com/api.json")
      .then(response => response.json())
      .then(data => {
        duco_price = round_to(5, data["Duco price"]);
      });

    fetch(`https://server.duinocoin.com/users/${nameInput.value}`)
      .then(response => response.json())
      .then(data => {
        data = data.result;
        balance = round_to(4, parseFloat(data.balance.balance));
        let balanceusd = balance * duco_price;
        console.log("Balance received: " + balance + " ($" + balanceusd + ")");

        userBalance.querySelector("h1").innerHTML = balance;
        userBalance.querySelectorAll("span")[1].innerHTML = round_to(4, balanceusd);

        transactions.innerHTML = "";

        let transJson = data.transactions;
        for(let t in transJson) {
          transactions.innerHTML += 
          `<tr class="bg-white border-2 border-gray-200 fadeIn">
            <td>
                <span class="text-center ml-2 font-semibold">${transJson[t].sender}</span>
            </td>
            <td>
                <span class="text-center ml-2 font-semibold">${transJson[t].recipient}</span>
            </td>
            <td>
                <span class="text-center ml-2 font-semibold">${transJson[t].amount}</span>
            </td>
            <td>
                <span class="text-center ml-2 font-semibold">${transJson[t].datetime}</span>
            </td>
            <td>
                <span class="text-center ml-2 font-semibold"><a href="https://explorer.duinocoin.com/?search=${transJson[t].hash}" target="_blank">(${transJson[t].hash.substring(0, 6)})</a></span>
            </td>
        </tr>`;
        }
      });

    ducoContract.methods.balanceOf(userAccounts[0]).call().then((bscBalance) => {
      userBalanceBsc.querySelector("h1").innerHTML = round_to(4, web3.utils.fromWei(bscBalance, 'ether'));
    });
  };

  const onSubmitLogin = (e) => {
    e.preventDefault();
    const username = nameInput.value;
    const password = passInput.value;

    if (username.length > 0 && password.length > 0) {
      fetch(`https://server.duinocoin.com/v2/auth/${encodeURIComponent(username)}?password=${window.btoa(unescape(encodeURIComponent(password)))}`).then(data => data.json()).then(data => {
        if (data.success == true) {
          console.log("User logged-in");
          loginForm.classList.add("hidden");
          dashboard.classList.remove("hidden");
          updateUserData();
          setInterval(() => {
            updateUserData();
          }, 10000);
        }
        else {
          console.log("User not logged-in");
          error.classList.remove("hidden");
          error.querySelector(".title").innerHTML = "Error";
          error.querySelector(".data").innerHTML = `<b>Invalid Credentials. </b>` + data.message + `</b><br></p>`;
          wrapBtn.disabled = false;
        }
      });
    }
  };

  const isMetaMaskInstalled = () => {
    const ethereum = window.ethereum;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  const onClickInstall = () => {
    window.location.href = "https://metamask.io/";
  };

  const onClickConnect = async () => {
    try {
      await ethereum.request({ method: 'eth_requestAccounts' }).then(async () => {

        // Changing the net to the Binance Smart Chain mainnet
        try {
          if (web3.currentProvider.chainId == 56) {
            console.log("Correctly connected to BSC");
            ducoContract = new web3.eth.Contract([{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }], "name": "RevokeWrapper", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": true, "internalType": "string", "name": "_ducoUsername", "type": "string" }], "name": "UnwrapConfirmed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": true, "internalType": "string", "name": "_ducoUsername", "type": "string" }], "name": "UnwrapInitiated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "Wrap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }], "name": "allowWrapper", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_oldAdmin", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_newAdmin", "type": "address" }], "name": "changeAdminConfirmed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_currentAdmin", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_newAdmin", "type": "address" }], "name": "changeAdminRequest", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "ChangeAdmin", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "addWrapperAccess", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "cancelChangeAdmin", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "string", "name": "_ducousername", "type": "string" }], "name": "cancelWithdrawals", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "checkWrapperStatus", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "confirmChangeAdmin", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_ducousername", "type": "string" }, { "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "confirmWithdraw", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "currentAdmin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getUserList", "outputs": [{ "components": [{ "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "string", "name": "username", "type": "string" }, { "internalType": "uint256", "name": "pendingBalance", "type": "uint256" }], "internalType": "struct ERC20.addressUsername[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_ducousername", "type": "string" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "initiateWithdraw", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "string", "name": "_ducousername", "type": "string" }], "name": "pendingWithdrawals", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "name": "positionInList", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "revokeWrapperAccess", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "name": "userExists", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "usersList", "outputs": [{ "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "string", "name": "username", "type": "string" }, { "internalType": "uint256", "name": "pendingBalance", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "usersListLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tronaddress", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "wrap", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }], "0xCF572cA0AB84d8Ce1652b175e930292E2320785b");
          }
          else if (web3.currentProvider.chainId == 137) {
            console.log("Correctly connected to Polygon");
            ducoContract = new web3.eth.Contract([{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }], "name": "RevokeWrapper", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": true, "internalType": "string", "name": "_ducoUsername", "type": "string" }], "name": "UnwrapConfirmed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": true, "internalType": "string", "name": "_ducoUsername", "type": "string" }], "name": "UnwrapInitiated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "Wrap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_address", "type": "address" }], "name": "allowWrapper", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_oldAdmin", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_newAdmin", "type": "address" }], "name": "changeAdminConfirmed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_currentAdmin", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_newAdmin", "type": "address" }], "name": "changeAdminRequest", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "ChangeAdmin", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "addWrapperAccess", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "cancelChangeAdmin", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "string", "name": "_ducousername", "type": "string" }], "name": "cancelWithdrawals", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "checkWrapperStatus", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "confirmChangeAdmin", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_ducousername", "type": "string" }, { "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "confirmWithdraw", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "currentAdmin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getUserList", "outputs": [{ "components": [{ "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "string", "name": "username", "type": "string" }, { "internalType": "uint256", "name": "pendingBalance", "type": "uint256" }], "internalType": "struct ERC20.addressUsername[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_ducousername", "type": "string" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "initiateWithdraw", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "string", "name": "_ducousername", "type": "string" }], "name": "pendingWithdrawals", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "name": "positionInList", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "revokeWrapperAccess", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "name": "userExists", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "usersList", "outputs": [{ "internalType": "address", "name": "_address", "type": "address" }, { "internalType": "string", "name": "username", "type": "string" }, { "internalType": "uint256", "name": "pendingBalance", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "usersListLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tronaddress", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "wrap", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }], "0xaf965beB8C830aE5dc8280d1c7215B8F0aCC0CeA");
          }
          else await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: "0x38" }] });
          userAccounts = await ethereum.request({ method: 'eth_accounts' });
          $("#wrapAddress").value = userAccounts[0];
          $("#unwrapAddress").value = userAccounts[0];
        } catch (error) {
          console.error(error);
        }

        $("#loginModal").classList.add("hidden");
        loginForm.classList.remove("hidden");
        loginSubmit.addEventListener("click", onSubmitLogin);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const MetaMaskClientCheck = () => {
    if (!isMetaMaskInstalled()) {
      mmaskButton.innerText = 'Install MetaMask';
      mmaskButton.addEventListener('click', onClickInstall);
      mmaskButton.disabled = false;
    } else {
      mmaskButton.innerText = 'Connect';
      mmaskButton.addEventListener('click', onClickConnect);
      mmaskButton.disabled = false;
    }
  };

  ethereum.on('chainChanged', function (accounts) {
    window.location.reload();
  });

  MetaMaskClientCheck();
};

window.addEventListener('DOMContentLoaded', initialize);