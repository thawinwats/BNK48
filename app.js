const request = require('request')
const { JSDOM } = require('jsdom')
const { existsSync, mkdirSync, createWriteStream } = require('fs')

const PATHFILE = './BNK48'

const BNK48_URL = `https://www.bnk48.com`
const BNK48_MEMBER_URL = `${BNK48_URL}/index.php?page=members`

const saveImageToDisk = ({ uri, path, filename }) => {
  return new Promise((resolve, reject) =>
    request(uri)
      .on('error', err => reject(err))
      .pipe(createWriteStream(`${path}/${filename}`))
      .on('close', resolve(filename))
  )
}

const downloadAll = async member => {
  return await Promise.all(
    member.map(async bnk => {
      const variable = {
        uri: bnk.image,
        path: PATHFILE,
        filename: `${bnk.name}.png`,
      }

      return await saveImageToDisk(variable)
    })
  )
}

const startServer = async () => {
  // check images path file
  if (!existsSync(PATHFILE)) mkdirSync(PATHFILE)

  request.get(BNK48_MEMBER_URL, async (error, response, body) => {
    const { window } = new JSDOM(body)
    const { document } = window

    const members = document.querySelectorAll('.boxMemx')

    const bnkMember = [...members].map(member => {
      const name = member.querySelector('.nameMem').innerHTML
      const imageURL = member
        .querySelector('.ImgMem')
        .style.getPropertyValue('background-image')

      // remove "url(" and ")" to get the url
      const imagePath = imageURL.replace(/url\(|\)/g, '')

      const image = `${BNK48_URL}/${imagePath}`

      return { name: name.trim(), image }
    })

    downloadAll(bnkMember)
  })
}

startServer()
