import subprocess
#intended to be used when OneDrive is being nonresponsive or is taking up vast amounts of system resources
print("----------------")
print("Killing OneDrive...")
print("----------------")
# finds and kills OneDrive process
result = subprocess.run(['killall', 'OneDrive'], stdout=subprocess.PIPE)
if result.stdout:
	print(result)
print("OneDrive Killed")
print("----------------")
print("Opening OneDrive...")
print("----------------")
#reopens OneDrive after it is killed, which ususally corrects the problem
result = subprocess.run(['open', '-a', 'OneDrive'], stdout=subprocess.PIPE)
if result.stdout:
	print(result)
print("OneDrive open")

