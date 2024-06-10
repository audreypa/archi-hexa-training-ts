import { v4 as uuidv4 } from "uuid"

export interface PanierRepository {
  sauver(panier: Panier): Promise<void>
  recuperer(panierId: string): Promise<Panier>
}

export class Panier {

  private items: Array<Item>

  constructor(
    public readonly id:string,
    private references: Array<string>
  ) {
    this.items = []
  }

  ajouterReference(reference: string) {
    this.references.push(reference)
  }

  retirerReference(reference: string) {
    const index = this.references.findIndex(r => r === reference)
    this.references.splice(index, 1)
  }

  toDTO(): PanierDTO {
    return {
      id: this.id,
      references: this.references.map(r => r)
    }
  }

  getReferences(): Array<string> {
    return this.references.map(r => r)
  }

  ajouterItems(reference: string, quantite: number): void {
    const index= this.items.findIndex(i => i.reference === reference)
    if (index > -1) {
      this.items[index].quantite += quantite
      return
    } 

    this.items.push({reference: reference, quantite:quantite})
  }

  incrementerItem(reference: string) {
    this.ajouterItems(reference, 1)
  }

  decrementerItem(reference: string) {
    const index= this.items.findIndex(i => i.reference === reference)
    this.items[index].quantite -= 1
    if (this.items[index].quantite == 0) {
      this.retirerItem(reference)
    }
  }

  retirerItem(reference:string) {
    const index= this.items.findIndex(i => i.reference === reference)
    this.items.splice(index,1)
  }

  getItems():Array<Item> {
    return this.items
  }
}

type Item = {
  reference: string,
  quantite: number
}

export interface PanierPresenter {
  envoyerLigne(ligne: string): void
}

export class UtiliserPanier {
  panierRepository: PanierRepository

  constructor(panierRepository: PanierRepository) {
    this.panierRepository = panierRepository
  }

  async initialiserPanier(): Promise<string> {
    const panier = new Panier(uuidv4(), [])
    await this.panierRepository.sauver(panier)
    return panier.id
  }

  async ajouterReference(panierId: string, reference: string): Promise<PanierDTO> {
    const panier = await this.panierRepository.recuperer(panierId)
    panier.ajouterReference(reference)
    await this.panierRepository.sauver(panier)
    return panier.toDTO()
  }

  async retirerReference(panierId: string, reference: string): Promise<PanierDTO> {
    const panier = await this.panierRepository.recuperer(panierId)
    panier.retirerReference(reference)
    await this.panierRepository.sauver(panier)
    return panier.toDTO()
  }

  async visualiserPanier(panierId: string): Promise<PanierDTO> {
    const panier = await this.panierRepository.recuperer(panierId)
    return panier.toDTO()
  }

  async visualiserPanier2(panierId: string, presenter:PanierPresenter): Promise<void> {
    const panier = await this.panierRepository.recuperer(panierId)
    const ref = panier.getReferences()
    presenter.envoyerLigne(`Panier ${panier.id}`)
    ref.forEach(r => {
      presenter.envoyerLigne(`   ${r}`)
    })
  }
}

export type PanierDTO = {
  id: string
  references: Array<string>
}
