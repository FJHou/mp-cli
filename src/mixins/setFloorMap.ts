import { getBrandBaseInfo } from "../utils/JDH-pharmacy/index";

export default Behavior({
    data: {
        showFloorMap: {}
    },

    ready() {
        console.log('attached');
        
        this.setFloorMap()
    },

    moved() {
        console.log('moved');
        
    },

    methods: {
        async setFloorMap(){
            try {
                const { showFloorMap } = await getBrandBaseInfo();
                this.setData!({
                    showFloorMap
                });
            } catch (e) {
                console.error(e);
            }
        }
    }
  })