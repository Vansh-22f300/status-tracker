<template>
  <div class="yesterday-section">
    <div class="header">
    <div class="label">
        Yesterday's Overview
    </div>
</div>
    <div class="grid">
        <div class="grid-item" v-for="user in teamData" :key=user.name>
            <div class="profile-pic">{{getInitials(user.name)}}</div>
            <div class="grid-info">
                <div class="grid-name">{{user.name}}</div>
                <div class="grid-status">{{user.status}}</div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
    const { teamData } = useData();
    const {getInitials}=useInitials();
</script>
<style scoped>
.yesterday-section{
    margin:35px;
    padding:15px;
    background-color:#fdfcfa;
    border-radius:10px;
}
.grid{
    display:grid;
    grid-template-columns: repeat(3,1fr);
    /* background-color:pink; */
}
.label{
    font-size:10px;
    letter-spacing:1px;
    text-transform:uppercase;
    color:grey;
    margin-bottom:20px;
}
.grid-item{
    display:flex;
    align-items:center;
    gap:20px;
    /* margin-top:20px; */
    margin:5px;
    border-radius:8px;
    border:1px solid  #e8e4dc;;
    padding:5px;
    /* gap:10px; */
}
.profile-pic{
    width:30px;
    height:30px;
    background-color: #e8e4dc;
    color:grey;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    font-size:11px;
}
.grid-info{
    display:flex;
    flex-direction:column;
}
.grid-name{
    font-size:15px;
    font-weight:500;
}
.grid-status{
    padding: 5px 0px;
  border-radius: 5px;
  font-size: 11px;
  color: #afaca7;
}
</style>