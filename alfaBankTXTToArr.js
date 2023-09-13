import request from "request";

const alfaBantTXTToArr = async (ctx) => {
  const fileId = ctx.message.document.file_id;
  const fileLink = await ctx.telegram.getFileLink(fileId);
  const fileUrl = fileLink.href;

  const txtChunks = [];

  await new Promise((resolve, reject) => {
    request
      .get(fileUrl)
      .on("data", (chunk) => txtChunks.push(chunk))
      .on("end", resolve)
      .on("error", reject);
  });

  const txtBuffer = Buffer.concat(txtChunks);
  const str = txtBuffer.toString("utf-8");

  const lines = str.split(/\n/);

  const transactions = [];
  let currentTransaction = { name: "" };

  for (const line of lines) {
    currentTransaction.name += line.trim();

    const match = currentTransaction.name.match(
      /(\d{2}.\d{2}.\d{4})(.*?)BYN(.*)/
    );

    if (match) {
      const [date, name, costStr] = match.slice(1);
      const cost = parseFloat(
        costStr.replace(/BYN/g, "").replace(",", ".").trim()
      );

      if (name && costStr) {
        currentTransaction = {
          date,
          name: name.trim().substring(0, name.trim().lastIndexOf(" ")),
          cost,
        };

        transactions.push(currentTransaction);
        currentTransaction = { name: "" };
      }
    }
  }

  return transactions;
};

export default alfaBantTXTToArr;
