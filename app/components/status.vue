<template>
    <div class="section">
        <p class="label">
            YOUR STATUS TODAY
        </p>
        <div class="list">

            <div class="card" :class="{
                selected_office:selectedstatus=='wfo'
            }"
                @click="selectstatus('wfo')">
                <div class="card-icon">
                    🏢
                </div>
                <div class="card-name">
                    In Office
                </div>
                <div class="card-status">
                    Available at Office
                </div>
            </div>
            <div class="card" :class="{
                selected_home:selectedstatus=='wfh'
            }"
             @click="selectstatus('wfh')">
                <div class="card-icon">
🏠
                </div>
                <div class="card-name">
                    Work From Home
                </div>
                <div class="card-status">
                    Remote Today
                </div>
            </div>




        </div>
        <div class="submit" v-if="selectedstatus">
            <div class="submit-info">
                <div>Available {{ selectedstatus ==='wfo' ? 'Office' :'WFH' }}— will notify MAP Team C</div>
            <div class="submit-time">Posting as You {{time}}</div>
            </div>
            
            <div class="notify-btn" @click="notified">Notify Group ➡️</div>
        </div>

    </div>


</template>

<script setup>
    import {ref, computed} from 'vue';
    const selectedstatus=ref(null);
    const time=ref('')
    let interval=null;
    function selectstatus(status){
        selectedstatus.value=status;
    }
    function notified(){
        console.log("Posted",selectedstatus.value);
        console.log(time)
    }
    const updateTime=()=>{
        time.value= new Date().toLocaleTimeString(
                    'en-IN',
                    { hour: 'numeric', minute: 'numeric'}
                );
    }
    onMounted(()=>{
        updateTime();
        interval=setInterval(updateTime,60000)
    })
    onUnmounted(()=>{
        clearInterval(interval)
    })

</script>

<style scoped>
.section{
    /* margin-top:30px; */
    padding:30px;
}
.label{
    color:#868584;
    font-size:12px;
}
.list{
    /* background-color:pink; */
    display:flex;
    gap:20px;
    /* border-radius:10px; */
}
.card{
    /* margin:20px; x */
    background-color:white;
    border-radius:15px ;
    width:430px;
    /* height:200px; */
    padding:30px;
        border:1px solid rgb(73, 72, 72);
        box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
        cursor:pointer;

}
.card:hover{
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
.card-icon{
    font-size:32px;
    margin-bottom:20px;
    box-shadow:
}
.card-name{
    font-size:24px;
    font-weight:bold;
}
.card-status{
    color:#868584;
}

.submit{
    padding:20px;
    background-color:rgb(255, 255, 255);
    margin-top:20px;
    display:flex;
    align-items:center;
    border-radius:10px;
    border:1px solid grey;
}
.submit-info{
    
    margin-right:auto;
}
.submit-time{
    color:#868584;
    font-size:12px;
}
.notify-btn{
    padding:10px 15px;
    background-color:black;
    color:white;
    cursor:pointer;
    border-radius:8px;
}
.notify-btn:hover{
    background-color:rgb(46, 46, 46);
    color:white;
    transform:translateY(2px);
}
.selected_office{
    border:1px solid green;
    background-color:  #d0eddc;;
}

.selected_home{
    border:1px solid blue;
    background-color:  #d0dfed;;
}

</style>