# ERC20 Market

## Testarea Sistemelor Software

Toate testele implementate pot fi gasite in folder-ul [test](https://github.com/BluThund3r/erc20-market/tree/main/test).

Toate documentele pentru disciplina **Testarea Sistemelor Software** se pot gasi in folder-ul [Testare](https://github.com/BluThund3r/erc20-market/tree/main/Testare).

Videoclipul cu demo-ul aplicatiei si rularea testelor poate fi gasit [aici](https://www.youtube.com/watch?v=T_gPLeHKJ3A&ab_channel=IoanStoica).

Prezentarea PowerPoint a proiectului poate fi gasita [aici](https://github.com/BluThund3r/erc20-market/blob/main/Testare/Prezentare.pptx).

Raportul de folosire a unui tool AI poate fi gasit [aici](https://github.com/BluThund3r/erc20-market/blob/main/Testare/Raport%20de%20folosire%20a%20chatGPT%20in%20testarea%20software.docx).

## Deploy aplicatie
- in terminal, in folderul `/smartcontracts` rulati `npm run startLocal`  (Asta o sa ruleze reteaua, deployeaza contractele de  lprouter si eth token si copiaza fisierele .json (care contin abi-urile contractelor) într-un folder in frontend)
- in terminal, in folderul `/frontend` rulati `npm run dev`
- instalezi metamask
- adaugi primul token din lista celor generate pe reteaua locala in metamask
- adaugi reteaua locala in metamask ( https://medium.com/@kaishinaw/connecting-metamask-with-a-local-hardhat-network-7d8cea604dc6 )
- intri pe aplicatie: http://localhost:5173/
