<?php
$data = file_get_contents("php://input");
$json_a = json_decode($data,true);
$dirName = $json_a["name"];
$timestamp = $json_a["startTime"];
$path = "accelerationData/".$dirName."/".$timestamp.".json";
$success = saveFile($path, $data);
if($success){
	echo "success";
}else{
	echo "error";
}


    function saveFile($fileName, $text) {
        if (!$fileName || !$text)
            return false;

        if (makeDir(dirname($fileName))) {
            if ($fp = fopen($fileName, "w")) {
                if (@fwrite($fp, $text)) {
                    fclose($fp);
                    return true;
                } else {
                    fclose($fp);
                    return false;
                } 
            } 
        } 
        return false;
    } 

    function makeDir($dir, $mode = "0777") {
        if (!$dir) return false;

        if(!file_exists($dir)) {
            return mkdir($dir,$mode,true);
        } else {
            return true;
        }
        
    }

/*
echo $data;
$str = split(',',$data);
echo "<br/>";
for($i=0;$i < count($str); $i++)
{
   $new[] = $str[$i];
   echo "<br/>";
   echo $str[$i];
}
$value = rand(0, 3);
echo "<br/>";
echo $str[$value];
*/
?>
